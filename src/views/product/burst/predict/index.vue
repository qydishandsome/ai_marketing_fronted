<template>
  <div class="hit-predict">
    <div class="page-header">
      <h3>AI 新品爆款预测</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建预测
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="产品名称">
          <el-input v-model="filterForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="已完成" value="completed" />
            <el-option label="进行中" value="processing" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-section">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="targetAudience" label="目标人群" width="150" />
        <el-table-column prop="aiModel" label="AI模型" width="120" />
        <el-table-column prop="status" label="预测状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewResult(row)" :disabled="row.status !== 1">查看结果</el-button>
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

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑预测' : '新建爆款预测'" width="700px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="140px">
        <el-form-item label="产品" prop="productId">
          <el-select v-model="formData.productId" placeholder="请选择产品" @change="handleProductChange" style="width: 100%">
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="`${product.name} - ${product.spec}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品详情">
          <el-input v-model="productDetail" disabled type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="目标人群" prop="targetAudience">
          <el-select v-model="formData.targetAudience" placeholder="请选择目标人群" style="width: 100%">
            <el-option
              v-for="item in audienceList"
              :key="item.id"
              :label="`${item.audienceName} - ${item.description}`"
              :value="item.audienceName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联品类">
          <el-select v-model="formData.relatedCategory" placeholder="请选择关联品类" style="width: 100%">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.typeName"
              :value="item.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="formData.aiModel" placeholder="请选择AI模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item label="联网搜索">
          <el-switch v-model="formData.enableSearch" />
          <span class="form-tip">开启后将获取最新市场资讯</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePredict" :loading="predicting">
          {{ predicting ? '预测中...' : '开始预测' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resultVisible" title="预测结果" width="900px" :close-on-click-modal="false">
      <div class="predict-result" v-if="currentResult">
        <div class="result-header">
          <h3>{{ currentResult.productName }} - 爆款预测报告</h3>
          <p class="result-meta">
            AI模型：{{ currentResult.aiModel }} | 预测时间：{{ currentResult.createTime }}
          </p>
        </div>

        <div class="result-content">
          <el-alert
            title="预测结果"
            type="success"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <div v-html="formatResultContent(currentResult.predictionResult)"></div>
          </el-alert>

          <div v-if="currentResult.reportContent">
            <h4>详细分析报告</h4>
            <el-input
              v-model="currentResult.reportContent"
              type="textarea"
              :rows="15"
              readonly
            />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadReport">下载报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as productApi from '@/api/products'
import * as productAnalysisApi from '@/api/product-analysis'
import * as baseDataApi from '@/api/base-data'
import { audiences } from '@/api/business'

const filterForm = reactive({ productName: '', status: '' })
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const formVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  productId: undefined as number | undefined,
  targetAudience: '',
  relatedCategory: '',
  aiModel: 'deepseek',
  enableSearch: true
})
const productDetail = ref('')
const productList = ref<any[]>([])
const audienceList = ref<any[]>([])
const categoryList = ref<any[]>([])
const predicting = ref(false)

const formRules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  targetAudience: [{ required: true, message: '请输入目标人群', trigger: 'blur' }]
}

const resultVisible = ref(false)
const currentResult = ref<any>(null)

const loadPredicts = async () => {
  loading.value = true
  try {
    const response = await productAnalysisApi.getHitPredicts({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    // 处理不同的响应结构
    const content = response.content || response.list || []
    tableData.value = content.map((item: any) => ({
      ...item,
      productName: item.productName || item.product?.name || (productList.value.find(p => p.id === item.productId)?.name) || `产品ID: ${item.productId}`,
      specification: item.specification || item.product?.spec || (productList.value.find(p => p.id === item.productId)?.specification) || '',
      targetAudience: item.targetAudience || item.audienceName || '',
      status: item.status !== undefined ? item.status : (item.reportContent ? 1 : 0)
    }))
    pagination.total = response.totalElements || response.total || 0

    if (tableData.value.length === 0 && pagination.total === 0) {
      console.warn('爆款预测列表为空，请检查后端数据')
    }
  } catch (error) {
    console.error('加载预测列表失败:', error)
    ElMessage.error('加载预测列表失败')
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await productApi.getProducts({ page: 0, size: 1000 })
    // 处理不同的响应结构: { stats, page: { content: [...] } }
    const data = response as any
    if (data.page?.content) {
      productList.value = data.page.content
    } else if (data.list) {
      productList.value = data.list
    } else if (data.content) {
      productList.value = data.content
    } else if (Array.isArray(data)) {
      productList.value = data
    } else {
      productList.value = []
    }

    if (productList.value.length === 0) {
      console.warn('产品列表为空，请检查后端数据')
    }
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  }
}

const loadAudiences = async () => {
  try {
    const res = await audiences.getList({ page: 0, size: 1000 })
    const data = res as any
    audienceList.value = data.content || data.list || data.data?.list || []
  } catch (error) {
    console.error('加载人群列表失败:', error)
  }
}

const loadCategories = async () => {
  try {
    categoryList.value = await baseDataApi.productTypes.getAll() || []
  } catch (error) {
    console.error('加载品类列表失败:', error)
  }
}

const handleFilter = () => { pagination.page = 1; loadPredicts() }
const handleReset = () => { filterForm.productName = ''; filterForm.status = ''; pagination.page = 1; loadPredicts() }
const handleSizeChange = (val: number) => { pagination.size = val; loadPredicts() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadPredicts() }

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    productId: undefined,
    targetAudience: '',
    relatedCategory: '',
    aiModel: 'deepseek',
    enableSearch: true
  })
  productDetail.value = ''
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleProductChange = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  if (product) {
    productDetail.value = `${product.skuCode || ''} | ${product.spec || ''} | 品类ID: ${product.categoryId || ''}`
  }
}

const handlePredict = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      predicting.value = true
      try {
        const product = productList.value.find(p => p.id === formData.productId)
        const params = {
          productId: formData.productId,
          productName: product?.name,
          targetAudience: formData.targetAudience,
          relatedCategory: formData.relatedCategory,
          aiModel: formData.aiModel,
          enableSearch: formData.enableSearch
        }

        // 创建预测任务（后端会同步创建一个 status=0 的记录）
        const taskResponse = await productAnalysisApi.predictHit(params)
        ElMessage.success('爆款预测任务已创建，正在分析中...')

        // 后端 HitPredictController.predictHit 已经处理了记录保存逻辑，这里不再重复调用 saveHitPredict
        /*
        if (!isEdit.value) {
          await productAnalysisApi.saveHitPredict({
            productId: formData.productId,
            audienceId: null,
            predictCycle: '30天',
            aiModel: formData.aiModel
          })
        }
        */

        formVisible.value = false
        await loadPredicts()

        // 轮询查询结果
        pollResult(taskResponse.taskId)
      } catch (error) {
        ElMessage.error('创建预测任务失败')
      } finally {
        predicting.value = false
      }
    }
  })
}

const pollResult = async (taskId: string) => {
  const interval = setInterval(async () => {
    try {
      const result = await productAnalysisApi.getPredictResult(taskId)
      const status = (result as any).task ? (result as any).task.status : result.status
      const errorMsg = (result as any).task ? (result as any).task.error : result.error
      if (status === 'completed' || status === 'success') {
        clearInterval(interval)
        ElMessage.success('爆款预测完成')
        await loadPredicts()
      } else if (status === 'failed' || status === 'error') {
        clearInterval(interval)
        ElMessage.error('预测失败：' + (errorMsg || '未知错误'))
        await loadPredicts()
      }
    } catch (error) {
      clearInterval(interval)
    }
  }, 3000)
}

const handleViewResult = async (row: any) => {
  try {
    const result = await productAnalysisApi.getHitPredictById(row.id)
    currentResult.value = {
      ...result,
      productName: row.productName,
      specification: row.specification
    }
    resultVisible.value = true
  } catch (error) {
    ElMessage.error('获取预测结果失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除预测"${row.productName}"吗？`, '提示', { type: 'warning' })
    await productAnalysisApi.deleteHitPredict(row.id)
    ElMessage.success('删除成功')
    await loadPredicts()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleDownloadReport = () => {
  ElMessage.success('报告下载中，请稍候...')
}

const handleExport = () => {
  ElMessage.success('数据导出中，请稍候...')
}

const formatResultContent = (content: string) => {
  if (!content) return '暂无结果'
  return content.replace(/\n/g, '<br>')
}

const getStatusType = (status: number) => {
  const types: Record<number, any> = {
    1: 'success',
    0: 'warning',
    2: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    1: '已完成',
    0: '进行中',
    2: '失败'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  loadPredicts()
  loadProducts()
  loadAudiences()
  loadCategories()
})
</script>

<style scoped lang="scss">
.hit-predict {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 { margin: 0; color: #303133; font-size: 18px; }
    .header-actions { display: flex; gap: 10px; }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .filter-form { margin: 0; }
  }

  .table-section {
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }

  .predict-result {
    .result-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      h3 { margin: 0 0 10px 0; color: #303133; }
      .result-meta { margin: 0; color: #909399; font-size: 13px; }
    }

    .result-content {
      h4 { margin: 0 0 15px 0; color: #303133; font-size: 16px; font-weight: 600; }
    }
  }
}
</style>
