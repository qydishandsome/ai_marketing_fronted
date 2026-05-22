<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">{{ $route.meta.title }}</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增预测
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

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
        <el-table-column label="预测周期" min-width="180" align="center">
          <template #default="{ row }">
            {{ formatDateRange(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="aiModel" label="AI模型" width="120" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
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

    <!-- 新增预测弹窗 -->
    <el-dialog v-model="formVisible" title="库存预测" width="600px" :close-on-click-modal="false">
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
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="销售数据文件" prop="salesFile">
          <el-upload
            :auto-upload="false"
            :on-change="(file) => handleFileChange(file, 'salesFile')"
            :file-list="salesFileList"
            :limit="1"
          >
            <el-button type="primary">选择销售数据文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持.xlsx、.csv格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="活动方案文件" prop="planFile">
          <el-upload
            :auto-upload="false"
            :on-change="(file) => handleFileChange(file, 'planFile')"
            :file-list="planFileList"
            :limit="1"
          >
            <el-button type="primary">选择活动方案文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持.xlsx、.csv、.pdf格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="AI模型" prop="aiModel">
          <el-select v-model="formData.aiModel" placeholder="请选择AI模型" style="width: 100%">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">开始预测</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="预测详情" width="900px">
      <div v-if="currentRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="产品">{{ getProductName(currentRow) }}</el-descriptions-item>
          <el-descriptions-item label="AI模型">{{ currentRow.aiModel }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentRow.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentRow.endDate }}</el-descriptions-item>
          <el-descriptions-item label="销售数据文件" :span="2">
            <el-link :href="currentRow.salesFileUrl" target="_blank" type="primary">查看文件</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="活动方案文件" :span="2">
            <el-link :href="currentRow.planFileUrl" target="_blank" type="primary">查看文件</el-link>
          </el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">预测报告</el-divider>
        <div v-if="currentRow.reportContent" class="report-content">
          <el-input :value="currentRow.reportContent" type="textarea" :rows="15" readonly />
        </div>
        <div v-else class="text-muted">
          <el-empty description="AI分析中，请稍后..." />
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus'
import * as businessApi from '@/api/business'
import * as productApi from '@/api/products'

const filterForm = reactive({
  productId: undefined as number | undefined
})

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const products = ref<any[]>([])

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  productId: undefined as number | undefined,
  startDate: '',
  endDate: '',
  salesFile: null as any,
  planFile: null as any,
  aiModel: 'deepseek'
})
const formRules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  salesFile: [{ required: true, message: '请上传销售数据文件', trigger: 'change' }],
  planFile: [{ required: true, message: '请上传活动方案文件', trigger: 'change' }],
  aiModel: [{ required: true, message: '请选择AI模型', trigger: 'change' }]
}
const saving = ref(false)
const salesFileList = ref<UploadUserFile[]>([])
const planFileList = ref<UploadUserFile[]>([])

const detailVisible = ref(false)
const currentRow = ref<any>(null)

const loadInventoryPreds = async () => {
  loading.value = true
  try {
    const response = await businessApi.inventoryPreds.getList({
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
    console.error('加载库存预测列表失败:', error)
    ElMessage.error('加载库存预测列表失败')
  } finally {
    loading.value = false
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
  loadInventoryPreds()
}

const handleReset = () => {
  filterForm.productId = undefined
  pagination.page = 1
  loadInventoryPreds()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadInventoryPreds()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadInventoryPreds()
}

const handleAdd = () => {
  Object.assign(formData, {
    productId: undefined,
    startDate: '',
    endDate: '',
    salesFile: null,
    planFile: null,
    aiModel: 'deepseek'
  })
  salesFileList.value = []
  planFileList.value = []
  formRef.value?.clearValidate()
  formVisible.value = true
}

const handleFileChange = (file: any, field: string) => {
  formData[field] = file.raw
  if (field === 'salesFile') {
    salesFileList.value = [file]
  } else {
    planFileList.value = [file]
  }
}

const handleSave = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const result = await businessApi.inventoryPreds.create(formData)
        ElMessage.success('预测任务已创建，请稍后查看结果')
        formVisible.value = false
        await loadInventoryPreds()
      } catch (error) {
        ElMessage.error('创建预测任务失败')
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

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条预测记录吗？', '提示', { type: 'warning' })
    await businessApi.inventoryPreds.delete(row.id)
    ElMessage.success('删除成功')
    await loadInventoryPreds()
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

const formatDateRange = (row: any) => {
  if (row.startDate && row.endDate) {
    return `${row.startDate} 至 ${row.endDate}`
  }
  return '-'
}

const getStatusType = (row: any) => {
  return row.reportContent ? 'success' : 'warning'
}

const getStatusText = (row: any) => {
  return row.reportContent ? '已完成' : '分析中'
}

onMounted(() => {
  loadProducts()
  loadInventoryPreds()
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
.report-content {
  :deep(.el-textarea__inner) {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
