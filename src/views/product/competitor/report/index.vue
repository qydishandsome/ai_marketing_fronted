<template>
  <div class="competitor-report">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-group">
        <h4>公司产品池筛选</h4>
        <el-form :inline="true" :model="companyProductFilter" class="filter-form">
          <el-form-item label="产品类别">
            <el-select v-model="companyProductFilter.category" placeholder="请选择" clearable>
              <el-option label="蛋白粉" value="蛋白粉" />
              <el-option label="维生素" value="维生素" />
              <el-option label="运动补剂" value="运动补剂" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌">
            <el-input v-model="companyProductFilter.brand" placeholder="请输入品牌" />
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="companyProductFilter.productName" placeholder="请输入产品名称" />
          </el-form-item>
          <el-form-item label="规格">
            <el-input v-model="companyProductFilter.specification" placeholder="请输入规格" />
          </el-form-item>
          <el-form-item label="平台">
            <el-select v-model="companyProductFilter.platform" placeholder="请选择" clearable>
              <el-option label="抖音" value="抖音" />
              <el-option label="小红书" value="小红书" />
              <el-option label="京东" value="京东" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="filter-group">
        <h4>竞品池筛选</h4>
        <el-form :inline="true" :model="competitorFilter" class="filter-form">
          <el-form-item label="竞品名称">
            <el-input v-model="competitorFilter.competitorName" placeholder="请输入竞品名称" />
          </el-form-item>
          <el-form-item label="平台">
            <el-select v-model="competitorFilter.platform" placeholder="请选择" clearable>
              <el-option label="抖音" value="抖音" />
              <el-option label="小红书" value="小红书" />
              <el-option label="京东" value="京东" />
            </el-select>
          </el-form-item>
          <el-form-item label="KOL/KOC">
            <el-input v-model="competitorFilter.kol" placeholder="请输入KOL/KOC" />
          </el-form-item>
          <el-form-item label="时间排序">
            <el-select v-model="competitorFilter.timeOrder" placeholder="请选择" clearable>
              <el-option label="最新" value="desc" />
              <el-option label="最早" value="asc" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 报告列表 -->
    <div class="table-section">
      <div class="table-header">
        <el-button type="primary" @click="handleExport">导出报告</el-button>
        <el-button @click="handleRefresh">刷新数据</el-button>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />

        <!-- 公司本品信息 -->
        <el-table-column label="公司本品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ getProductName(row.baseProductId) }}</div>
              <div class="product-detail">{{ getProductBrand(row.baseProductId) }} | {{ getProductSpec(row.baseProductId) }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 竞品详细信息 -->
        <el-table-column label="竞品详细信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.compName }}</div>
              <div class="product-detail">{{ row.salesPlatform }} | {{ row.salesAmount }}万</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="salesAmount" label="竞品销售额" width="120">
          <template #default="{ row }">
            ¥{{ row.salesAmount || 0 }}万
          </template>
        </el-table-column>

        <el-table-column prop="kolKocNames" label="合作KOL/KOC" width="150" show-overflow-tooltip />

        <el-table-column prop="createTime" label="生成时间" width="160" />

        <el-table-column label="竞品AI分析报告" min-width="150">
          <template #default="{ row }">
            <el-button
              v-if="row.aiReportContent"
              link
              type="primary"
              @click="handleViewReport(row)"
            >
              <el-icon><Document /></el-icon>
              查看报告
            </el-button>
            <el-button
              v-else
              link
              type="primary"
              @click="handleGenerateReport(row)"
            >
              <el-icon><Document /></el-icon>
              生成报告
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
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

    <!-- 报告预览弹窗 -->
    <el-dialog
      v-model="reportPreviewVisible"
      title="竞品AI分析报告预览"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="report-preview">
        <div class="report-header">
          <h3>{{ getProductName(currentReport.baseProductId) }} vs {{ currentReport.compName }}</h3>
          <p class="report-meta">
            生成时间：{{ currentReport.createTime || currentReport.updateTime }}
          </p>
        </div>

        <div class="report-content">
          <div v-if="currentReport.aiReportContent">
            <el-input
              v-model="currentReport.aiReportContent"
              type="textarea"
              :rows="20"
              readonly
            />
          </div>
          <div v-else class="no-report">
            <el-empty description="暂无分析报告" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="reportPreviewVisible = false">关闭</el-button>
        <el-button v-if="currentReport.aiReportContent" type="primary" @click="handleDownloadReport">下载报告</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editFormVisible"
      title="编辑竞品"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="140px">
        <el-form-item label="本公司产品">
          <el-select
            v-model="editForm.baseProductId"
            placeholder="请选择本公司产品"
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
          <el-input v-model="editForm.compName" placeholder="请输入竞品名称" />
        </el-form-item>
        <el-form-item label="平台" prop="salesPlatform">
          <el-select v-model="editForm.salesPlatform" placeholder="请选择平台" style="width: 100%">
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="京东" value="京东" />
            <el-option label="淘宝" value="淘宝" />
          </el-select>
        </el-form-item>
        <el-form-item label="销售额(万)">
          <el-input-number v-model="editForm.salesAmount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合作KOL/KOC">
          <el-input v-model="editForm.kolKocNames" placeholder="请输入合作的KOL/KOC" />
        </el-form-item>
        <el-form-item label="分析报告">
          <el-input
            v-model="editForm.aiReportContent"
            type="textarea"
            :rows="5"
            placeholder="AI分析报告内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as productApi from '@/api/products'
import * as productAnalysisApi from '@/api/product-analysis'

// 公司产品池筛选
const companyProductFilter = reactive({
  category: '',
  brand: '',
  productName: '',
  specification: '',
  platform: ''
})

// 竞品池筛选
const competitorFilter = reactive({
  competitorName: '',
  platform: '',
  kol: '',
  timeOrder: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 产品列表
const productList = ref<any[]>([])

// 报告预览
const reportPreviewVisible = ref(false)
const currentReport = ref<any>({})

// 编辑表单
const editFormVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: undefined as number | undefined,
  baseProductId: undefined as number | undefined,
  compName: '',
  salesPlatform: '',
  salesAmount: 0,
  kolKocNames: '',
  aiReportContent: ''
})
const editRules: FormRules = {
  compName: [{ required: true, message: '请输入竞品名称', trigger: 'blur' }],
  salesPlatform: [{ required: true, message: '请选择平台', trigger: 'change' }]
}
const saving = ref(false)

const loadCompetitors = async () => {
  loading.value = true
  try {
    const response = await productAnalysisApi.getCompetitors({
      ...competitorFilter,
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

const getProductName = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  return product ? product.name : `产品ID: ${productId}`
}

const getProductSpec = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  return product?.spec || product?.specification || ''
}

const getProductBrand = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  return product?.brand || ''
}

// 筛选
const handleFilter = () => {
  console.log('筛选条件：', { companyProductFilter, competitorFilter })
  pagination.page = 1
  loadCompetitors()
}

// 重置
const handleReset = () => {
  Object.assign(companyProductFilter, {
    category: '',
    brand: '',
    productName: '',
    specification: '',
    platform: ''
  })
  Object.assign(competitorFilter, {
    competitorName: '',
    platform: '',
    kol: '',
    timeOrder: ''
  })
  pagination.page = 1
  loadCompetitors()
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadCompetitors()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadCompetitors()
}

// 查看报告
const handleViewReport = (row: any) => {
  currentReport.value = row
  reportPreviewVisible.value = true
}

// 生成报告
const handleGenerateReport = async (row: any) => {
  try {
    const params = {
      baseProductId: row.baseProductId,
      competitorId: row.id,
      aiModel: 'deepseek',
      enableSearch: true,
      description: '生成竞品AI分析报告'
    }

    const response = await productAnalysisApi.analyzeCompetitors(params)
    ElMessage.success('AI竞品分析任务已创建，正在生成报告...')

    // 轮询查询结果
    pollAnalyzeResult(response.taskId)
  } catch (error) {
    ElMessage.error('创建分析任务失败')
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

// 编辑
const handleEdit = (row: any) => {
  Object.assign(editForm, {
    id: row.id,
    baseProductId: row.baseProductId,
    compName: row.compName,
    salesPlatform: row.salesPlatform,
    salesAmount: row.salesAmount || 0,
    kolKocNames: row.kolKocNames || '',
    aiReportContent: row.aiReportContent || ''
  })
  editFormRef.value?.clearValidate()
  editFormVisible.value = true
}

const handleSaveEdit = async () => {
  editFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await productAnalysisApi.updateCompetitor(editForm.id!, editForm)
        ElMessage.success('更新成功')
        editFormVisible.value = false
        await loadCompetitors()
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该竞品记录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await productAnalysisApi.deleteCompetitor(row.id)
    ElMessage.success('删除成功')
    await loadCompetitors()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 下载报告
const handleDownloadReport = () => {
  ElMessage.success('报告下载中，请稍候...')
  reportPreviewVisible.value = false
}

// 导出
const handleExport = () => {
  ElMessage.success('报告导出中，请稍候...')
}

// 刷新
const handleRefresh = () => {
  loadCompetitors()
  ElMessage.success('数据刷新成功')
}

onMounted(async () => {
  await loadProducts()
  await loadCompetitors()
})
</script>

<style scoped lang="scss">
.competitor-report {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .filter-section {
    margin-bottom: 20px;

    .filter-group {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 15px;

      &:last-child { margin-bottom: 0; }

      h4 {
        margin: 0 0 15px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }

      .filter-form {
        margin: 0;

        :deep(.el-form-item) { margin-bottom: 12px; }
      }
    }
  }

  .table-section {
    .table-header {
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-info {
      .product-name {
        font-weight: 600;
        color: #303133;
        margin-bottom: 5px;
      }

      .product-detail {
        font-size: 12px;
        color: #909399;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .report-preview {
    .report-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      h3 { margin: 0 0 10px 0; color: #303133; }
      .report-meta { margin: 0; color: #909399; font-size: 13px; }
    }

    .report-content {
      .no-report { padding: 40px 0; }
    }
  }
}
</style>
