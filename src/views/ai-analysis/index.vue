<template>
  <div class="ai-analysis">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>AI 数据分析</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建数据分析
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分析名称">
          <el-input v-model="filterForm.name" placeholder="请输入分析名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="已完成" value="completed" />
            <el-option label="进行中" value="processing" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="filterForm.aiModel" placeholder="请选择" clearable>
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据分析列表 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="分析名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="分析描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="aiModel" label="AI模型" width="120" />
        <el-table-column prop="fileCount" label="上传文件数" width="100">
          <template #default="{ row }">
            {{ row.fileCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新建/编辑数据分析弹窗 -->
    <el-dialog
      v-model="analysisFormVisible"
      :title="isEdit ? '编辑数据分析' : '新建数据分析'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="analysisForm" :rules="analysisRules" ref="analysisFormRef" label-width="120px">
        <el-form-item label="分析名称" prop="name">
          <el-input v-model="analysisForm.name" placeholder="请输入分析名称" />
        </el-form-item>
        <el-form-item label="分析描述" prop="description">
          <el-input
            v-model="analysisForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分析描述，作为AI分析的背景设定"
          />
        </el-form-item>
        <el-form-item label="多源数据融合">
          <el-upload
            v-model:file-list="analysisForm.fileList"
            action="#"
            :auto-upload="false"
            multiple
            :on-change="handleFileChange"
            :limit="10"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传多个异构文件（.md、.csv、.txt、.pdf等），作为AI的知识库和数据源
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="analysisForm.aiModel" placeholder="请选择AI模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item label="联网搜索">
          <el-switch v-model="analysisForm.enableSearch" />
          <span class="form-tip">开启后将获取最新资讯数据</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="analysisFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon v-if="!generating"><MagicStick /></el-icon>
          {{ generating ? '生成中...' : '生成内容' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 分析结果展示弹窗 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="分析结果"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="analysis-result" v-if="currentAnalysis">
        <div class="result-header">
          <h3>{{ currentAnalysis.name }}</h3>
          <p class="result-meta">
            AI模型：{{ currentAnalysis.aiModel }} | 创建时间：{{ currentAnalysis.createTime }}
          </p>
        </div>

        <div class="result-content">
          <el-alert
            title="分析说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            {{ currentAnalysis.description }}
          </el-alert>

          <div class="generated-content">
            <div class="content-editor">
              <el-input
                v-model="generatedContent"
                type="textarea"
                :rows="15"
                placeholder="AI生成的内容将显示在这里"
              />
            </div>
          </div>

          <div class="result-actions">
            <el-button type="primary" @click="handleSaveResult">
              <el-icon><Check /></el-icon>
              保存结果
            </el-button>
            <el-button @click="handleRegenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button @click="handleCopyResult">
              <el-icon><CopyDocument /></el-icon>
              复制内容
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 详情查看弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="数据分析详情"
      width="900px"
    >
      <div class="analysis-detail" v-if="currentAnalysis">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析名称">{{ currentAnalysis.name }}</el-descriptions-item>
          <el-descriptions-item label="AI模型">{{ currentAnalysis.aiModel }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentAnalysis.status)">
              {{ getStatusText(currentAnalysis.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上传文件数">{{ currentAnalysis.fileCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentAnalysis.createTime }}</el-descriptions-item>
          <el-descriptions-item label="分析描述" :span="2">{{ currentAnalysis.description }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">分析结果</el-divider>
        <div class="result-content-detail">
          <el-input
            v-model="currentAnalysis.reportContent"
            type="textarea"
            :rows="15"
            readonly
            placeholder="AI正在努力分析中，请稍后..."
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  MagicStick,
  Check,
  Refresh,
  CopyDocument
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus'
import * as businessApi from '@/api/business'

// 筛选表单
const filterForm = reactive({
  name: '',
  status: '',
  aiModel: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 分析表单
const analysisFormVisible = ref(false)
const isEdit = ref(false)
const analysisFormRef = ref<FormInstance>()
const analysisForm = reactive({
  name: '',
  description: '',
  fileList: [] as UploadUserFile[],
  aiModel: 'deepseek',
  enableSearch: true
})

const analysisRules: FormRules = {
  name: [{ required: true, message: '请输入分析名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入分析描述', trigger: 'blur' }]
}

// 生成相关
const generating = ref(false)
const resultDialogVisible = ref(false)
const currentAnalysis = ref<any>(null)
const generatedContent = ref('')

// 详情弹窗
const detailDialogVisible = ref(false)

const loadAnalyses = async () => {
  loading.value = true
  try {
    const response = await businessApi.aiAnalysis.getList({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    // 处理不同的响应结构
    const content = response.content || []
    tableData.value = content.map((item: any) => ({
      ...item,
      name: item.analysisName || '',
      description: item.promptDesc || '',
      fileCount: item.filesJson ? JSON.parse(item.filesJson || '[]').length : 0,
      status: item.reportContent ? 'completed' : 'processing'
    }))
    pagination.total = response.totalElements || 0
  } catch (error) {
    console.error('加载分析列表失败:', error)
    ElMessage.error('加载分析列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadAnalyses()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.status = ''
  filterForm.aiModel = ''
  pagination.page = 1
  loadAnalyses()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadAnalyses()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadAnalyses()
}

// 新建分析
const handleAdd = () => {
  isEdit.value = false
  Object.assign(analysisForm, {
    name: '',
    description: '',
    fileList: [],
    aiModel: 'deepseek',
    enableSearch: true
  })
  analysisFormRef.value?.clearValidate()
  analysisFormVisible.value = true
}

// 文件变化
const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  console.log('文件列表：', uploadFiles)
}

// 生成内容
const handleGenerate = async () => {
  analysisFormRef.value?.validate(async (valid) => {
    if (valid) {
      generating.value = true
      try {
        const dataToSend = {
          analysisName: analysisForm.name,
          promptDesc: analysisForm.description,
          aiModel: analysisForm.aiModel,
          enableSearch: analysisForm.enableSearch,
          files: analysisForm.fileList
        }

        if (isEdit.value) {
          await businessApi.aiAnalysis.update(currentAnalysis.value.id, dataToSend)
          ElMessage.success('更新成功')
        } else {
          await businessApi.aiAnalysis.create(dataToSend)
          ElMessage.success('创建成功')
        }

        analysisFormVisible.value = false
        await loadAnalyses()

        // 模拟AI生成过程
        setTimeout(() => {
          generating.value = false
          currentAnalysis.value = {
            ...dataToSend,
            name: dataToSend.analysisName,
            description: dataToSend.promptDesc,
            createTime: new Date().toLocaleString('zh-CN')
          }

          generatedContent.value = `基于您提供的分析描述和多源数据，AI生成以下分析结果：

## 市场趋势分析

根据当前市场数据和行业动态，我们发现以下关键趋势：

1. **数字化转型加速**
   - 线上销售渠道占比持续提升
   - 社交电商成为新的增长点
   - AI技术在营销中的应用日益广泛

2. **消费者需求变化**
   - 健康意识显著提升
   - 个性化需求增长
   - 对产品品质要求更高

3. **竞争格局演变**
   - 市场集中度逐步提高
   - 品牌差异化竞争加剧
   - 渠道融合成为趋势

## 数据洞察

通过分析多个数据源，我们发现：
- 整体市场规模同比增长15.3%
- 线上渠道占比达到68.7%
- 复购率提升至42.5%

## 建议与对策

基于以上分析，建议：
1. 加强数字化营销投入
2. 优化产品结构，满足个性化需求
3. 深化渠道合作，提升市场覆盖率
4. 建立数据驱动的决策机制`

          resultDialogVisible.value = true
          ElMessage.success('AI分析完成')
        }, 3000)
      } catch (error) {
        generating.value = false
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }
    }
  })
}

// 保存结果
const handleSaveResult = () => {
  ElMessage.success('分析结果已保存')
  resultDialogVisible.value = false
}

// 重新生成
const handleRegenerate = () => {
  ElMessage.info('正在重新生成...')
  setTimeout(() => {
    ElMessage.success('重新生成完成')
  }, 2000)
}

// 复制结果
const handleCopyResult = () => {
  navigator.clipboard.writeText(generatedContent.value)
  ElMessage.success('内容已复制到剪贴板')
}

const pollTimer = ref<any>(null)

// 查看详情
const handleViewDetail = async (row: any) => {
  loading.value = true
  try {
    const response = await businessApi.aiAnalysis.getById(row.id)
    currentAnalysis.value = response
    detailDialogVisible.value = true

    // 如果分析还没完成，开启轮询
    startPolling(row.id)
  } catch (error) {
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

const startPolling = (id: number) => {
  stopPolling()
  pollTimer.value = setInterval(async () => {
    if (!detailDialogVisible.value) {
      stopPolling()
      return
    }
    try {
      const response = await businessApi.aiAnalysis.getById(id)
      currentAnalysis.value = response
      // 如果已经有报告内容或者报错了，停止轮询
      if (response.reportContent && !response.reportContent.includes('分析失败')) {
        stopPolling()
        loadAnalyses() // 刷新列表状态
      }
    } catch (e) {
      console.error('轮询失败', e)
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

onBeforeUnmount(() => {
  stopPolling()
})

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  currentAnalysis.value = row
  Object.assign(analysisForm, {
    name: row.name,
    description: row.description,
    fileList: [],
    aiModel: row.aiModel || 'deepseek',
    enableSearch: true
  })
  analysisFormRef.value?.clearValidate()
  analysisFormVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除分析"${row.name}"吗？`, '提示', { type: 'warning' })
    await businessApi.aiAnalysis.delete(row.id)
    ElMessage.success('删除成功')
    await loadAnalyses()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('数据导出中，请稍候...')
}

// 状态类型
const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    completed: 'success',
    processing: 'warning',
    pending: 'info'
  }
  return types[status] || 'info'
}

// 状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '已完成',
    processing: '进行中',
    pending: '待处理'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  loadAnalyses()
})
</script>

<style scoped lang="scss">
.ai-analysis {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #303133;
      font-size: 18px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .filter-form {
      margin: 0;

      :deep(.el-form-item) {
        margin-bottom: 12px;
      }
    }
  }

  .table-section {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }

  .analysis-result {
    .result-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 18px;
      }

      .result-meta {
        margin: 0;
        color: #909399;
        font-size: 13px;
      }
    }

    .result-content {
      .generated-content {
        margin-bottom: 20px;

        .content-editor {
          :deep(.el-textarea__inner) {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
          }
        }
      }

      .result-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
      }
    }
  }

  .analysis-detail {
    .result-content-detail {
      :deep(.el-textarea__inner) {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
      }
    }
  }
}
</style>
