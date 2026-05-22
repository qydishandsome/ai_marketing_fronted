<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">{{ $route.meta.title }}</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增数据
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="分销商">
          <el-select 
            v-model="filterForm.distId" 
            placeholder="请选择分销商" 
            clearable 
            filterable 
            style="width: 200px"
            @change="handleFilterDistChange"
          >
            <el-option
              v-for="dist in distributors"
              :key="dist.id"
              :label="dist.distName"
              :value="dist.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="filterForm.productId" placeholder="请选择产品" clearable filterable style="width: 200px">
            <el-option
              v-for="product in filterProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-input v-model="filterForm.platformUrl" placeholder="请输入平台链接" clearable />
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
        <el-table-column prop="distributor.distName" label="分销商" min-width="150" />
        <el-table-column prop="product.name" label="产品" min-width="150" />
        <el-table-column prop="platformUrl" label="平台链接" min-width="200" show-overflow-tooltip />
        <el-table-column prop="commentCount" label="评论数" width="100" align="center" />
        <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskType(row.riskLevel)">{{ row.riskLevel || '未评估' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
            <el-button
              link
              type="success"
              @click="handleAIAnalyze(row)"
              :loading="row.analyzing"
              :disabled="!!row.reportContent"
            >
              {{ row.reportContent ? '已分析' : 'AI分析' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="pagination.total"
          :page-size="pagination.size"
          :current-page="pagination.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="formVisible" title="新增风险识别" width="600px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="分销商" prop="distId">
          <el-select 
            v-model="formData.distId" 
            placeholder="请选择分销商" 
            style="width: 100%"
            @change="handleFormDistChange"
          >
            <el-option
              v-for="dist in distributors"
              :key="dist.id"
              :label="dist.distName"
              :value="dist.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="productId">
          <el-select 
            v-model="formData.productId" 
            placeholder="请选择产品" 
            style="width: 100%"
            :disabled="!formData.distId"
          >
            <el-option
              v-for="product in formProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台链接" prop="platformUrl">
          <el-input v-model="formData.platformUrl" placeholder="请输入平台链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="风险分析详情" width="800px">
      <div v-if="currentRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分销商">{{ currentRow.distributor?.distName }}</el-descriptions-item>
          <el-descriptions-item label="产品">{{ currentRow.product?.name }}</el-descriptions-item>
          <el-descriptions-item label="平台链接" :span="2">{{ currentRow.platformUrl }}</el-descriptions-item>
          <el-descriptions-item label="评论数">{{ currentRow.commentCount }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskType(currentRow.riskLevel)">{{ currentRow.riskLevel || '未评估' }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">分析报告</el-divider>
        <div v-if="currentRow.reportContent">
          <el-input :value="currentRow.reportContent" type="textarea" :rows="10" readonly />
        </div>
        <div v-else class="text-muted">暂无分析报告</div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as riskApi from '@/api/risk'
import * as distributorApi from '@/api/distributors'
import * as productApi from '@/api/products'

const filterForm = reactive({
  distId: undefined as number | undefined,
  productId: undefined as number | undefined,
  platformUrl: ''
})

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const distributors = ref<any[]>([])
const products = ref<any[]>([]) // 全量产品缓存
const filterProducts = ref<any[]>([]) // 筛选栏联动产品
const formProducts = ref<any[]>([]) // 弹窗联动产品

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  distId: undefined as number | undefined,
  productId: undefined as number | undefined,
  platformUrl: ''
})
const formRules: FormRules = {
  distId: [{ required: true, message: '请选择分销商', trigger: 'change' }],
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  platformUrl: [{ required: true, message: '请输入平台链接', trigger: 'blur' }]
}
const saving = ref(false)

const detailVisible = ref(false)
const currentRow = ref<any>(null)

// AI分析轮询
const analyzePollTimers = ref<Map<number, any>>(new Map())

const loadRisks = async () => {
  loading.value = true
  try {
    const response = await riskApi.getList({
      distId: filterForm.distId,
      productId: filterForm.productId,
      page: pagination.page - 1,
      size: pagination.size
    })
    const content = (response as any).content || []

    console.log('加载风险列表:', content.length, '条记录')
    console.log('可用产品数:', products.value.length)
    console.log('可用分销商数:', distributors.value.length)

    tableData.value = content.map((item: any) => {
      const product = products.value.find((p: any) => p.id === item.productId)
      const distributor = distributors.value.find((d: any) => d.id === item.distId)

      console.log(`风险记录 ${item.id}:`, {
        productId: item.productId,
        productName: product?.name,
        distId: item.distId,
        distName: distributor?.distName
      })

      return {
        ...item,
        distributor: distributor,
        product: product,
        commentCount: item.commentCount || item.fetchCount || 0
      }
    })
    pagination.total = (response as any).totalElements || (response as any).total || 0
  } catch (error) {
    console.error('加载风险列表失败:', error)
    ElMessage.error('加载风险列表失败')
  } finally {
    loading.value = false
  }
}

const loadDistributors = async () => {
  try {
    const response = await distributorApi.getDistributors({ page: 0, size: 1000 })
    distributors.value = response.list || response.content || []
  } catch (error) {
    console.error('加载分销商列表失败:', error)
  }
}

const loadProducts = async () => {
  try {
    const response = await productApi.getProducts({ page: 0, size: 1000 })
    // 后端返回结构是 { stats: {...}, page: { content: [...] } }
    const pageData = response.page || response
    products.value = pageData.content || pageData.list || []
    filterProducts.value = products.value // 默认展示全量
    formProducts.value = products.value
    console.log('加载产品列表成功:', products.value.length, '个产品')
    console.log('产品示例:', products.value[0])
  } catch (error) {
    console.error('加载产品列表失败:', error)
  }
}

// 筛选栏分销商联动
const handleFilterDistChange = async (distId: number) => {
  filterForm.productId = undefined
  if (!distId) {
    filterProducts.value = products.value
    return
  }
  try {
    filterProducts.value = await distributorApi.getDistributorProducts(distId)
  } catch (error) {
    ElMessage.error('加载分销商代理产品失败')
  }
}

// 弹窗分销商联动
const handleFormDistChange = async (distId: number) => {
  formData.productId = undefined
  if (!distId) {
    formProducts.value = []
    return
  }
  try {
    formProducts.value = await distributorApi.getDistributorProducts(distId)
    if (formProducts.value.length === 0) {
      ElMessage.warning('该分销商暂无代理产品，请先在分销商管理中配置')
    }
  } catch (error) {
    ElMessage.error('加载代理产品失败')
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadRisks()
}

const handleReset = () => {
  Object.assign(filterForm, {
    distId: undefined,
    productId: undefined,
    platformUrl: ''
  })
  pagination.page = 1
  loadRisks()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadRisks()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadRisks()
}

const handleAdd = () => {
  Object.assign(formData, {
    distId: undefined,
    productId: undefined,
    platformUrl: ''
  })
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleSave = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await riskApi.create(formData)
        ElMessage.success('创建成功')
        formVisible.value = false
        await loadRisks()
      } catch (error) {
        ElMessage.error('创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleViewDetail = (row: any) => {
  currentRow.value = row
  detailVisible.value = true
}

// AI分析
const handleAIAnalyze = async (row: any) => {
  if (row.reportContent) {
    ElMessage.info('该记录已完成AI分析')
    return
  }

  try {
    // 标记正在分析
    row.analyzing = true

    const response = await riskApi.create({
      distId: row.distId,
      productId: row.productId,
      platformUrl: row.platformUrl
    })

    if (response.taskId) {
      ElMessage.success('AI分析任务已创建，正在分析中...')

      // 开始轮询分析结果
      startPolling(row.id, response.taskId)
    } else {
      ElMessage.error('创建分析任务失败')
      row.analyzing = false
    }
  } catch (error) {
    console.error('AI分析失败:', error)
    ElMessage.error('AI分析失败')
    row.analyzing = false
  }
}

// 轮询分析结果
const startPolling = (rowId: number, taskId: string) => {
  // 清除已有的定时器
  if (analyzePollTimers.value.has(rowId)) {
    clearInterval(analyzePollTimers.value.get(rowId))
  }

  const timer = setInterval(async () => {
    try {
      const result = await riskApi.getResult(taskId)

      if (result.task && (result.task.status === 'success' || result.task.status === 'completed')) {
        // 分析完成
        clearInterval(timer)
        analyzePollTimers.value.delete(rowId)

        ElMessage.success('AI分析完成')

        // 刷新列表数据
        await loadRisks()
      } else if (result.task && result.task.status === 'failed') {
        // 分析失败
        clearInterval(timer)
        analyzePollTimers.value.delete(rowId)

        ElMessage.error('AI分析失败：' + (result.task.error || '未知错误'))

        // 刷新列表数据以移除loading状态
        await loadRisks()
      }
      // 如果是 pending 或 processing 状态，继续轮询
    } catch (error) {
      console.error('查询分析结果失败:', error)
      clearInterval(timer)
      analyzePollTimers.value.delete(rowId)
      await loadRisks()
    }
  }, 3000) // 每3秒轮询一次

  analyzePollTimers.value.set(rowId, timer)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条风险记录吗？', '提示', { type: 'warning' })
    await riskApi.deleteRisk(row.id)
    ElMessage.success('删除成功')
    await loadRisks()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}

const getRiskType = (level: string) => {
  const types: Record<string, string> = {
    '高风险': 'danger',
    '中风险': 'warning',
    '低风险': 'success'
  }
  return types[level] || 'info'
}

onMounted(async () => {
  // 先加载分销商和产品数据，再加载风险列表
  await Promise.all([
    loadDistributors(),
    loadProducts()
  ])
  loadRisks()
})

onBeforeUnmount(() => {
  // 清理所有轮询定时器
  analyzePollTimers.value.forEach((timer) => {
    clearInterval(timer)
  })
  analyzePollTimers.value.clear()
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
}
.filter-card {
  margin-bottom: 20px;
}
.table-card {
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
.text-muted {
  color: #909399;
}
</style>
