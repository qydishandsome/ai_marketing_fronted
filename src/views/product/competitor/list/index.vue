<template>
  <div class="competitor-list">
    <div class="page-header">
      <h2 class="page-title">{{ $route.meta.title }}</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增竞品
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="本公司产品">
          <el-select v-model="filterForm.baseProductId" placeholder="请选择产品" clearable filterable>
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="`${product.name} - ${product.spec}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="竞品名称">
          <el-input v-model="filterForm.compName" placeholder="请输入竞品名称" clearable />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="filterForm.salesPlatform" placeholder="请选择" clearable>
            <el-option
              v-for="platform in platforms"
              :key="platform.platformName"
              :label="platform.platformName"
              :value="platform.platformName"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="本公司产品" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getProductName(row.baseProductId) }}
          </template>
        </el-table-column>
        <el-table-column prop="compName" label="竞品名称" min-width="150" />
        <el-table-column prop="salesPlatform" label="平台" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPlatformType(row.salesPlatform)">{{ row.salesPlatform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salesAmount" label="销售额(万)" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.salesAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="kolKocNames" label="合作KOL/KOC" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleAnalyze(row)">AI分析</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
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
    </el-card>

    <!-- 新增/编辑竞品弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? '编辑竞品' : '新增竞品'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="140px">
        <el-form-item label="本公司产品" prop="baseProductId">
          <el-select
            v-model="formData.baseProductId"
            placeholder="请选择本公司产品"
            @change="handleProductChange"
            style="width: 100%"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="`${product.name} - ${product.spec}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="竞品名称" prop="compName">
          <el-input v-model="formData.compName" placeholder="请输入竞品名称" />
        </el-form-item>
        <el-form-item label="平台" prop="salesPlatform">
          <el-select v-model="formData.salesPlatform" placeholder="请选择平台" style="width: 100%">
            <el-option
              v-for="platform in platforms"
              :key="platform.platformName"
              :label="platform.platformName"
              :value="platform.platformName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="销售额(万)">
          <el-input-number v-model="formData.salesAmount" :min="0" placeholder="请输入销售额" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合作KOL/KOC">
          <el-input v-model="formData.kolKocNames" placeholder="请输入合作的KOL/KOC" />
        </el-form-item>
        <el-form-item label="竞品详情">
          <el-input v-model="formData.compDetail" type="textarea" :rows="3" placeholder="请输入竞品详情" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- AI分析弹窗 -->
    <el-dialog
      v-model="analyzeVisible"
      title="AI竞品分析"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="analyzeForm" label-width="120px">
        <el-form-item label="本公司产品">
          <el-input v-model="currentCompetitor.baseProductName" disabled />
        </el-form-item>
        <el-form-item label="竞品">
          <el-input v-model="currentCompetitor.compName" disabled />
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="analyzeForm.aiModel" placeholder="请选择AI模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item label="联网搜索">
          <el-switch v-model="analyzeForm.enableSearch" />
          <span class="form-tip">开启后将获取最新竞品资讯</span>
        </el-form-item>
        <el-form-item label="分析说明">
          <el-input
            v-model="analyzeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分析说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="analyzeVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStartAnalyze" :loading="analyzing">
          {{ analyzing ? '分析中...' : '开始分析' }}
        </el-button>
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

const filterForm = reactive({
  baseProductId: undefined as number | undefined,
  compName: '',
  salesPlatform: ''
})

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const productList = ref<any[]>([])
const platforms = ref<any[]>([])

const formVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  baseProductId: undefined as number | undefined,
  compName: '',
  salesPlatform: '',
  salesAmount: 0,
  kolKocNames: '',
  compDetail: ''
})
const formRules: FormRules = {
  baseProductId: [{ required: true, message: '请选择本公司产品', trigger: 'change' }],
  compName: [{ required: true, message: '请输入竞品名称', trigger: 'blur' }],
  salesPlatform: [{ required: true, message: '请选择平台', trigger: 'change' }]
}
const saving = ref(false)

const analyzeVisible = ref(false)
const analyzing = ref(false)
const analyzeForm = reactive({
  aiModel: 'deepseek',
  enableSearch: true,
  description: ''
})
const currentCompetitor = ref<any>({})

const loadCompetitors = async () => {
  loading.value = true
  try {
    const response = await productAnalysisApi.getCompetitors({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    ElMessage.error('加载竞品列表失败')
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await productApi.getProducts({ page: 0, size: 1000 })
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
  } catch (error) {
    console.error('加载产品列表失败:', error)
  }
}

const loadPlatforms = async () => {
  try {
    platforms.value = await baseDataApi.platforms.getAll()
  } catch (error) {
    console.error('加载平台列表失败:', error)
  }
}

const getProductName = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  return product ? product.name : `产品ID: ${productId}`
}

const handleFilter = () => { pagination.page = 1; loadCompetitors() }

const handleReset = () => {
  filterForm.baseProductId = undefined
  filterForm.compName = ''
  filterForm.salesPlatform = ''
  pagination.page = 1
  loadCompetitors()
}

const handleSizeChange = (val: number) => { pagination.size = val; loadCompetitors() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadCompetitors() }

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    baseProductId: undefined,
    compName: '',
    salesPlatform: '',
    salesAmount: 0,
    kolKocNames: '',
    compDetail: ''
  })
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    baseProductId: row.baseProductId,
    compName: row.compName,
    salesPlatform: row.salesPlatform,
    salesAmount: row.salesAmount || 0,
    kolKocNames: row.kolKocNames || '',
    compDetail: row.compDetail || ''
  })
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleProductChange = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  console.log('选择产品:', product)
}

const handleSave = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await productAnalysisApi.updateCompetitor(formData.id!, formData)
          ElMessage.success('更新成功')
        } else {
          await productAnalysisApi.createCompetitor(formData)
          ElMessage.success('创建成功')
        }
        formVisible.value = false
        await loadCompetitors()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleAnalyze = (row: any) => {
  currentCompetitor.value = {
    ...row,
    baseProductName: getProductName(row.baseProductId)
  }
  analyzeForm.aiModel = 'deepseek'
  analyzeForm.enableSearch = true
  analyzeForm.description = ''
  analyzeVisible.value = true
}

const handleStartAnalyze = async () => {
  analyzing.value = true
  try {
    const params = {
      baseProductId: currentCompetitor.value.baseProductId,
      competitorId: currentCompetitor.value.id,
      aiModel: analyzeForm.aiModel,
      enableSearch: analyzeForm.enableSearch,
      description: analyzeForm.description
    }

    const response = await productAnalysisApi.analyzeCompetitors(params)
    ElMessage.success('AI竞品分析任务已创建，正在分析中...')
    analyzeVisible.value = false

    // 轮询查询结果
    pollAnalyzeResult(response.taskId)
  } catch (error) {
    ElMessage.error('创建分析任务失败')
  } finally {
    analyzing.value = false
  }
}

const pollAnalyzeResult = async (taskId: string) => {
  const interval = setInterval(async () => {
    try {
      const result = await productAnalysisApi.getAnalyzeResult(taskId)
      if (result.status === 'completed') {
        clearInterval(interval)
        ElMessage.success('竞品分析完成')
        await loadCompetitors()
      } else if (result.status === 'failed') {
        clearInterval(interval)
        ElMessage.error('分析失败：' + result.error)
      }
    } catch (error) {
      clearInterval(interval)
    }
  }, 3000)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除竞品"${row.compName}"吗？`, '提示', { type: 'warning' })
    await productAnalysisApi.deleteCompetitor(row.id)
    ElMessage.success('删除成功')
    await loadCompetitors()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  ElMessage.success('数据导出中，请稍候...')
}

const getPlatformType = (platform: string) => {
  const types: Record<string, string> = {
    '抖音': 'primary',
    '小红书': 'danger',
    '京东': 'success',
    '淘宝': 'warning'
  }
  return types[platform] || 'info'
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadPlatforms()])
  await loadCompetitors()
})
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #409eff;
  }
  .header-actions { display: flex; gap: 10px; }
}

.filter-card { margin-bottom: 20px; }

.table-card {
  .pagination-container {
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
</style>
