<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">{{ $route.meta.title }}</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增监控
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 统计看板 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #409eff">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">监控总数</div>
              <div class="stats-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #67c23a">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">正常</div>
              <div class="stats-value">{{ stats.normal }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f56c6c">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">预警</div>
              <div class="stats-value">{{ stats.alert }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #e6a23c">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">预警率</div>
              <div class="stats-value">{{ stats.alertRate }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="产品">
          <el-select v-model="filterForm.productId" placeholder="请选择产品" clearable filterable style="width: 200px">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
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
        <el-table-column prop="product.name" label="产品" min-width="150">
          <template #default="{ row }">
            {{ getProductName(row) }}
          </template>
        </el-table-column>
        <el-table-column label="指导价区间" width="180" align="center">
          <template #default="{ row }">
            {{ row.guidePriceMin }} - {{ row.guidePriceMax }}
          </template>
        </el-table-column>
        <el-table-column prop="currentPrice" label="当前价格" width="120" align="center">
          <template #default="{ row }">
            <span style="font-weight: bold">¥{{ row.currentPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格趋势" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.priceTrend === 1" type="danger" size="small">
              <el-icon><Top /></el-icon> 上涨
            </el-tag>
            <el-tag v-else-if="row.priceTrend === -1" type="success" size="small">
              <el-icon><Bottom /></el-icon> 下跌
            </el-tag>
            <el-tag v-else type="info" size="small">
              <el-icon><Minus /></el-icon> 平稳
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.alertStatus === 1 ? 'danger' : 'success'" size="small">
              {{ row.alertStatus === 1 ? '预警' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="monitorFreq" label="监控频率" width="120" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑监控' : '新增监控'" width="600px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="产品" prop="productId">
          <el-select v-model="formData.productId" placeholder="请选择产品" style="width: 100%">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="监控频率" prop="monitorFreq">
          <el-select v-model="formData.monitorFreq" placeholder="请选择监控频率" style="width: 100%">
            <el-option label="每小时" value="每小时" />
            <el-option label="每天" value="每天" />
            <el-option label="每周" value="每周" />
          </el-select>
        </el-form-item>
        <el-form-item label="指导价下限" prop="guidePriceMin">
          <el-input-number v-model="formData.guidePriceMin" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="指导价上限" prop="guidePriceMax">
          <el-input-number v-model="formData.guidePriceMax" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Histogram,
  CircleCheck,
  Warning,
  TrendCharts,
  Top,
  Bottom,
  Minus
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as businessApi from '@/api/business'
import * as productApi from '@/api/products'

const filterForm = reactive({
  productId: undefined as number | undefined
})

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const products = ref<any[]>([])
const stats = reactive({
  total: 0,
  normal: 0,
  alert: 0,
  alertRate: '0%'
})

const formVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  productId: undefined as number | undefined,
  monitorFreq: '每天',
  guidePriceMin: 0,
  guidePriceMax: 0
})
const formRules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  monitorFreq: [{ required: true, message: '请选择监控频率', trigger: 'change' }],
  guidePriceMin: [{ required: true, message: '请输入指导价下限', trigger: 'blur' }],
  guidePriceMax: [{ required: true, message: '请输入指导价上限', trigger: 'blur' }]
}
const saving = ref(false)

const loadPriceMonitors = async () => {
  loading.value = true
  try {
    const response = await businessApi.priceMonitors.getList({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    const content = response.content || []
    tableData.value = content.map((item: any) => ({
      ...item,
      product: products.value.find(p => p.id === item.productId)
    }))
    pagination.total = response.totalElements || response.total || 0
  } catch (error) {
    console.error('加载价格监控列表失败:', error)
    ElMessage.error('加载价格监控列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await businessApi.priceMonitors.getStats()
    Object.assign(stats, response)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadProducts = async () => {
  try {
    const response = await productApi.getProducts({ page: 0, size: 1000 })
    // 后端返回结构是 { stats: {...}, page: { content: [...] } }
    const pageData = response.page || response
    products.value = pageData.content || pageData.list || []
  } catch (error) {
    console.error('加载产品列表失败:', error)
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadPriceMonitors()
}

const handleReset = () => {
  filterForm.productId = undefined
  pagination.page = 1
  loadPriceMonitors()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadPriceMonitors()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadPriceMonitors()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    productId: undefined,
    monitorFreq: '每天',
    guidePriceMin: 0,
    guidePriceMax: 0
  })
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    productId: row.productId,
    monitorFreq: row.monitorFreq,
    guidePriceMin: row.guidePriceMin,
    guidePriceMax: row.guidePriceMax
  })
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleSave = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await businessApi.priceMonitors.update(currentRow.value.id, formData)
          ElMessage.success('更新成功')
        } else {
          await businessApi.priceMonitors.create(formData)
          ElMessage.success('创建成功')
        }
        formVisible.value = false
        await loadPriceMonitors()
        await loadStats()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const currentRow = ref<any>(null)

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条监控记录吗？', '提示', { type: 'warning' })
    await businessApi.priceMonitors.delete(row.id)
    ElMessage.success('删除成功')
    await loadPriceMonitors()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}

const getProductName = (row: any) => {
  if (row.product) {
    return row.product.name
  }
  const product = products.value.find(p => p.id === row.productId)
  return product ? product.name : '未知产品'
}

onMounted(() => {
  loadProducts()
  loadPriceMonitors()
  loadStats()
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

.stats-row {
  margin-bottom: 20px;
  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        margin-right: 15px;
      }
      .stats-info {
        flex: 1;
        .stats-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }
        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
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
</style>
