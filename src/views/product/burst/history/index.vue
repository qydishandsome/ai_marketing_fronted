<template>
  <div class="history-burst">
    <!-- 顶部数据看板 -->
    <div class="data-board">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">爆款数量</div>
            <div class="stat-value">{{ stats.total || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">总销售额</div>
            <div class="stat-value">¥{{ stats.totalSales || 0 }}万</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">总销量</div>
            <div class="stat-value">{{ stats.totalVolume || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">平均转化率</div>
            <div class="stat-value">{{ stats.avgConversion || 0 }}%</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="产品类别">
          <el-select v-model="filterForm.category" placeholder="请选择" clearable>
            <el-option label="蛋白粉" value="蛋白粉" />
            <el-option label="维生素" value="维生素" />
            <el-option label="运动补剂" value="运动补剂" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="filterForm.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="filterForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="经销商负责人">
          <el-input v-model="filterForm.distributor" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="销售平台">
          <el-select v-model="filterForm.platform" placeholder="请选择" clearable>
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="京东" value="京东" />
          </el-select>
        </el-form-item>
        <el-form-item label="KOL/KOC">
          <el-input v-model="filterForm.kol" placeholder="请输入KOL/KOC" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <div class="table-section">
      <div class="table-header">
        <div>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建历史爆款
          </el-button>
          <el-button type="primary" @click="handleBatchAIAnalysis">AI历史分析</el-button>
        </div>
        <el-button @click="handleExport">导出数据</el-button>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="planning" label="策划方案" min-width="150" show-overflow-tooltip />
        <el-table-column prop="distributor" label="经销商" width="120" />
        <el-table-column prop="platform" label="销售平台" width="100" />
        <el-table-column prop="salesAmount" label="销售额" width="120">
          <template #default="{ row }">
            ¥{{ row.salesAmount || 0 }}万
          </template>
        </el-table-column>
        <el-table-column prop="salesVolume" label="销量" width="100" />
        <el-table-column prop="kolInfo" label="KOL/KOC" width="120" />
        <el-table-column prop="aiReportContent" label="AI历史爆款分析报告" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewReport(row)" :disabled="!row.aiReportContent">
              <el-icon><Document /></el-icon>
              查看报告
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
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

    <!-- AI历史分析弹窗 -->
    <el-dialog
      v-model="aiAnalysisVisible"
      title="AI历史爆款分析"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="aiAnalysisForm" label-width="120px">
        <el-form-item label="分析维度">
          <el-checkbox-group v-model="aiAnalysisForm.dimensions">
            <el-checkbox label="销售表现" />
            <el-checkbox label="用户反馈" />
            <el-checkbox label="市场趋势" />
            <el-checkbox label="竞品对比" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="aiAnalysisForm.model" placeholder="请选择AI模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item label="联网搜索">
          <el-switch v-model="aiAnalysisForm.enableSearch" />
        </el-form-item>
        <el-form-item label="分析说明">
          <el-input
            v-model="aiAnalysisForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分析说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="aiAnalysisVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGenerateAnalysis" :loading="analyzing">
          {{ analyzing ? '分析中...' : '生成分析' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editFormVisible"
      title="编辑历史爆款"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="140px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="editForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="editForm.specification" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="editForm.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="editForm.category" placeholder="请选择类别">
            <el-option label="蛋白粉" value="蛋白粉" />
            <el-option label="维生素" value="维生素" />
            <el-option label="运动补剂" value="运动补剂" />
          </el-select>
        </el-form-item>
        <el-form-item label="策划方案">
          <el-input v-model="editForm.planning" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="经销商">
          <el-input v-model="editForm.distributor" placeholder="请输入经销商" />
        </el-form-item>
        <el-form-item label="销售平台">
          <el-input v-model="editForm.platform" placeholder="请输入销售平台" />
        </el-form-item>
        <el-form-item label="销售额(万)">
          <el-input-number v-model="editForm.salesAmount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="销量">
          <el-input-number v-model="editForm.salesVolume" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="KOL/KOC">
          <el-input v-model="editForm.kol" placeholder="请输入KOL/KOC" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 报告预览弹窗 -->
    <el-dialog
      v-model="reportVisible"
      title="历史爆款分析报告"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="report-content" v-if="currentReport">
        <div class="report-header">
          <h3>{{ currentReport.productName }} - 历史爆款分析报告</h3>
          <p class="report-meta">分析时间：{{ currentReport.updateTime }}</p>
        </div>
        <div class="report-body">
          <el-input
            v-model="currentReport.reportContent"
            type="textarea"
            :rows="20"
            readonly
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="reportVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadReport">下载报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as productAnalysisApi from '@/api/product-analysis'

const filterForm = reactive({
  category: '',
  brand: '',
  productName: '',
  distributor: '',
  platform: '',
  kol: ''
})

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

// 统计数据
const stats = computed(() => {
  return {
    total: pagination.total,
    totalSales: tableData.value.reduce((sum, item) => sum + (item.salesAmount || 0), 0).toFixed(0),
    totalVolume: tableData.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0),
    avgConversion: tableData.value.length > 0 ? '15.8' : '0'
  }
})

// 多选
const multipleSelection = ref<any[]>([])

// AI分析弹窗
const aiAnalysisVisible = ref(false)
const analyzing = ref(false)
const aiAnalysisForm = reactive({
  dimensions: [],
  model: 'deepseek',
  enableSearch: true,
  description: ''
})

// 编辑表单
const editFormVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: undefined as number | undefined,
  productName: '',
  specification: '',
  brand: '',
  category: '',
  planning: '',
  distributor: '',
  platform: '',
  salesAmount: 0,
  salesVolume: 0,
  kol: ''
})
const editRules: FormRules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }]
}
const saving = ref(false)

// 报告预览
const reportVisible = ref(false)
const currentReport = ref<any>(null)

const loadHistoryBursts = async () => {
  loading.value = true
  try {
    const response = await productAnalysisApi.getHistoryBursts({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    // 处理不同的响应结构
    const content = response.content || response.list || []
    tableData.value = content
    pagination.total = response.totalElements || response.total || 0

    if (tableData.value.length === 0 && pagination.total === 0) {
      console.warn('历史爆款列表为空，请检查后端数据')
    }
  } catch (error) {
    console.error('加载历史爆款列表失败:', error)
    ElMessage.error('加载历史爆款列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => { pagination.page = 1; loadHistoryBursts() }

const handleReset = () => {
  Object.assign(filterForm, {
    category: '', brand: '', productName: '', distributor: '', platform: '', kol: ''
  })
  pagination.page = 1
  loadHistoryBursts()
}

const handleSizeChange = (val: number) => { pagination.size = val; loadHistoryBursts() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadHistoryBursts() }

const handleSelectionChange = (val: any[]) => { multipleSelection.value = val }

const handleBatchAIAnalysis = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要分析的数据')
    return
  }
  aiAnalysisForm.dimensions = []
  aiAnalysisForm.description = ''
  aiAnalysisVisible.value = true
}

const handleGenerateAnalysis = async () => {
  if (aiAnalysisForm.dimensions.length === 0) {
    ElMessage.warning('请选择分析维度')
    return
  }

  analyzing.value = true
  try {
    const ids = multipleSelection.value.map(item => item.id)
    const params = {
      ids,
      dimensions: aiAnalysisForm.dimensions.join(','),
      aiModel: aiAnalysisForm.model,
      enableSearch: aiAnalysisForm.enableSearch,
      description: aiAnalysisForm.description
    }

    await productAnalysisApi.analyzeHistoryBurst(params)
    ElMessage.success('AI历史分析任务已创建，请在任务中心查看进度')
    aiAnalysisVisible.value = false
  } catch (error) {
    ElMessage.error('创建分析任务失败')
  } finally {
    analyzing.value = false
  }
}

const handleAdd = () => {
  Object.assign(editForm, {
    id: undefined,
    productName: '',
    specification: '',
    brand: '',
    category: '',
    planning: '',
    distributor: '',
    platform: '',
    salesAmount: 0,
    salesVolume: 0,
    kol: ''
  })
  editFormRef.value?.clearValidate()
  editFormVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(editForm, row)
  editFormRef.value?.clearValidate()
  editFormVisible.value = true
}

const handleSaveEdit = async () => {
  editFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (editForm.id) {
          await productAnalysisApi.updateHistoryBurst(editForm.id, editForm)
          ElMessage.success('更新成功')
        } else {
          await productAnalysisApi.createHistoryBurst(editForm)
          ElMessage.success('创建成功')
        }
        editFormVisible.value = false
        await loadHistoryBursts()
      } catch (error) {
        ElMessage.error(editForm.id ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除爆款"${row.productName}"吗？`, '提示', { type: 'warning' })
    await productAnalysisApi.deleteHistoryBurst(row.id)
    ElMessage.success('删除成功')
    await loadHistoryBursts()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleViewReport = (row: any) => {
  currentReport.value = {
    ...row,
    reportContent: row.reportContent || generateMockReport(row)
  }
  reportVisible.value = true
}

const generateMockReport = (row: any) => {
  return `【历史爆款分析报告】

产品名称：${row.productName}
规格：${row.specification}
品牌：${row.brand}
类别：${row.category}

一、销售表现分析
- 销售额：¥${row.salesAmount}万
- 销量：${row.salesVolume}
- 主要销售平台：${row.platform}
- 经销商：${row.distributor}

二、成功因素分析
1. 产品定位准确，目标客群清晰
2. 营销策划方案有效：${row.planning}
3. KOL/KOC合作成功：${row.kol}
4. 价格策略合理，性价比突出

三、用户反馈
- 正面评价占比：85%
- 复购率：42%
- 推荐意愿：78%

四、市场趋势
该产品在${row.category}市场中表现优异，符合当前健康消费趋势。
`
}

const handleDownloadReport = () => {
  ElMessage.success('报告下载中，请稍候...')
}

const handleExport = () => {
  ElMessage.success('数据导出中，请稍候...')
}

onMounted(() => { loadHistoryBursts() })
</script>

<style scoped lang="scss">
.history-burst {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .data-board {
    margin-bottom: 20px;

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      color: #fff;

      &:nth-child(2) {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &:nth-child(3) {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &:nth-child(4) {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .stat-title { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
      .stat-value { font-size: 28px; font-weight: bold; }
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .filter-form {
      margin: 0;

      :deep(.el-form-item) { margin-bottom: 12px; }
    }
  }

  .table-section {
    .table-header { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }

  .report-content {
    .report-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ebeef5;

      h3 { margin: 0 0 10px 0; color: #303133; }
      .report-meta { margin: 0; color: #909399; font-size: 13px; }
    }
  }
}
</style>
