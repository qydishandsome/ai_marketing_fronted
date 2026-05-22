<template>
  <div class="distributor-portrait">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>分销商画像分析</h3>
      <div class="header-actions">
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分销商名称">
          <el-input v-model="filterForm.keyword" placeholder="请输入分销商名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="filterForm.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分销商画像列表 -->
    <div class="portrait-list" v-loading="loading">
      <div v-if="distributors.length === 0" class="no-data">
        <el-empty description="暂无分销商数据" />
      </div>
      <div
        v-for="distributor in distributors"
        :key="distributor.id"
        class="distributor-card"
      >
        <div class="distributor-header">
          <div class="distributor-info">
            <h4>{{ distributor.distName }}</h4>
            <p class="manager">负责人：{{ distributor.managerName }}</p>
            <p class="contact">联系电话：{{ distributor.phone }}</p>
            <p class="shop">店铺名称：{{ distributor.shopName }}</p>
          </div>
          <div class="distributor-stats">
            <div class="stat-item">
              <span class="label">画像分析数</span>
              <span class="value">{{ getProfileCount(distributor.id) }}</span>
            </div>
          </div>
          <div class="distributor-actions">
            <el-button
              type="primary"
              circle
              size="small"
              @click="handleAddPortrait(distributor)"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleViewProducts(distributor)"
            >
              查看代理产品
            </el-button>
          </div>
        </div>

        <div class="report-list" v-if="getProfilesByDistributor(distributor.id).length > 0">
          <el-table
            :data="getProfilesByDistributor(distributor.id)"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="productId" label="产品ID" width="100" />
            <el-table-column prop="aiModel" label="AI模型" width="120" />
            <el-table-column prop="status" label="分析状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status || 'completed')">
                  {{ getStatusText(row.status || 'completed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewReport(row)">
                  查看报告
                </el-button>
                <el-button link type="danger" @click="handleDeleteReport(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="no-reports" v-else>
          <el-empty description="暂无画像分析报告" :image-size="60" />
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 代理产品列表弹窗 -->
    <el-dialog
      v-model="productsDialogVisible"
      title="代理产品列表"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="products-content">
        <div class="distributor-summary">
          <h4>{{ currentDistributor.distName }}</h4>
          <p>负责人：{{ currentDistributor.managerName }} | 联系电话：{{ currentDistributor.phone }}</p>
        </div>

        <el-table
          :data="productList"
          border
          stripe
          style="width: 100%"
          v-loading="productsLoading"
        >
          <el-table-column prop="name" label="产品名称" min-width="150" />
          <el-table-column prop="brandName" label="品牌" width="100" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="categoryName" label="类别" width="100" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handlePortraitAnalysis(row)"
              >
                画像分析
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="productsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新建画像分析弹窗 -->
    <el-dialog
      v-model="portraitFormVisible"
      title="新建分销商画像分析"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="portraitForm" :rules="portraitRules" ref="portraitFormRef" label-width="120px">
        <el-form-item label="分销商">
          <el-input v-model="currentDistributor.distName" disabled />
        </el-form-item>
        <el-form-item label="代理产品" prop="productId">
          <el-select
            v-model="portraitForm.productId"
            placeholder="请选择代理产品"
            @change="handleProductChange"
            style="width: 100%"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="`${product.name} - ${product.specification}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品详情">
          <el-input v-model="productDetail" disabled type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="分析维度" prop="dimensions">
          <el-checkbox-group v-model="portraitForm.dimensions">
            <el-checkbox label="销售能力" />
            <el-checkbox label="客户资源" />
            <el-checkbox label="专业能力" />
            <el-checkbox label="合作信誉" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="历史销售数据">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 Excel、CSV 格式，文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="portraitForm.aiModel" placeholder="请选择AI模型">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
            <el-option label="通义千问" value="tongyi" />
          </el-select>
        </el-form-item>
        <el-form-item label="联网搜索">
          <el-switch v-model="portraitForm.enableSearch" />
          <span class="form-tip">开启后将获取最新市场资讯</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="portraitFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGeneratePortrait" :loading="generating">
          {{ generating ? '分析中...' : '开始分析' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 分析报告预览弹窗 -->
    <el-dialog
      v-model="reportPreviewVisible"
      title="画像分析报告"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="report-preview" v-if="currentReport">
        <div class="report-header">
          <h3>{{ currentDistributor.distName }} - 画像分析报告</h3>
          <p class="report-meta">
            分析时间：{{ currentReport.createTime }} | AI模型：{{ currentReport.aiModel }}
          </p>
        </div>

        <div class="report-content">
          <el-input
            v-model="currentReport.reportContent"
            type="textarea"
            :rows="20"
            readonly
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="reportPreviewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadReport">下载报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import * as distributorApi from '@/api/distributors'
import * as productApi from '@/api/products'
import * as baseDataApi from '@/api/base-data'

// 筛选表单
const filterForm = reactive({
  keyword: '',
  manager: ''
})

// 分销商数据
const distributors = ref<any[]>([])
const allProfiles = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 当前选中的分销商
const currentDistributor = ref<any>({})

// 代理产品弹窗
const productsDialogVisible = ref(false)
const productsLoading = ref(false)
const productList = ref<any[]>([])
// 基础数据缓存
const brands = ref<any[]>([])
const categories = ref<any[]>([])

// 画像分析表单
const portraitFormVisible = ref(false)
const portraitFormRef = ref<FormInstance>()
const portraitForm = reactive({
  productId: '',
  dimensions: [],
  aiModel: 'deepseek',
  enableSearch: true,
  salesFile: null as File | null
})
const productDetail = ref('')
const generating = ref(false)

const portraitRules: FormRules = {
  productId: [{ required: true, message: '请选择代理产品', trigger: 'change' }],
  dimensions: [{ required: true, message: '请选择分析维度', trigger: 'change' }]
}

// 报告预览
const reportPreviewVisible = ref(false)
const currentReport = ref<any>({})

// 计算属性 - 获取指定分销商的画像分析记录
const getProfilesByDistributor = (distributorId: number) => {
  return allProfiles.value.filter(p => p.distId === distributorId)
}

const getProfileCount = (distributorId: number) => {
  return getProfilesByDistributor(distributorId).length
}

const loadDistributors = async () => {
  loading.value = true
  try {
    const response = await distributorApi.getDistributors({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    // 适配后端分页对象 { content: [], totalElements: 0 }
    distributors.value = (response as any).content || []
    pagination.total = (response as any).totalElements || 0

    // 加载所有画像分析记录
    await loadAllProfiles()
  } catch (error) {
    ElMessage.error('加载分销商列表失败')
  } finally {
    loading.value = false
  }
}

const loadAllProfiles = async () => {
  try {
    // 批量加载画像记录
    const distIds = distributors.value.map(d => d.id)
    allProfiles.value = [] // 清空旧数据
    for (const distId of distIds) {
      const profiles = await distributorApi.getDistProfiles(distId)
      allProfiles.value.push(...(profiles || []))
    }
  } catch (error) {
    console.error('加载画像记录失败:', error)
  }
}

const loadDistributorProducts = async (distributorId: number) => {
  productsLoading.value = true
  try {
    const response = await distributorApi.getDistributorProducts(distributorId)

    // 如果基础数据还没加载，先加载
    if (brands.value.length === 0) {
      try {
        brands.value = await baseDataApi.brands.getAll()
        categories.value = await baseDataApi.productTypes.getAll()
      } catch (e) {
        console.error('加载基础数据失败:', e)
      }
    }

    // 关联品牌和类别名称
    productList.value = (response || []).map((product: any) => ({
      ...product,
      categoryName: categories.value.find((c: any) => c.id === product.categoryId)?.typeName || '',
      brandName: brands.value.find((b: any) => b.id === product.brandId)?.brandName || '',
      specification: product.spec || product.specification || ''
    }))
  } catch (error) {
    console.error('加载代理产品失败:', error)
    ElMessage.error('加载代理产品失败')
  } finally {
    productsLoading.value = false
  }
}

// 查看代理产品
const handleViewProducts = async (distributor: any) => {
  currentDistributor.value = distributor
  productsDialogVisible.value = true
  await loadDistributorProducts(distributor.id)
}

// 画像分析
const handlePortraitAnalysis = (product: any) => {
  portraitForm.productId = product.id
  productDetail.value = `${product.brand || ''} | ${product.specification || ''} | ${product.categoryName || ''}`
  portraitFormVisible.value = true
  productsDialogVisible.value = false
}

// 新增画像分析
const handleAddPortrait = async (distributor: any) => {
  currentDistributor.value = distributor
  // 先加载产品列表
  await loadDistributorProducts(distributor.id)
  // 然后打开表单
  portraitForm.productId = ''
  productDetail.value = ''
  portraitForm.dimensions = []
  portraitForm.salesFile = null
  portraitFormVisible.value = true
}

// 产品变化
const handleProductChange = (productId: number) => {
  const product = productList.value.find(p => p.id === productId)
  if (product) {
    productDetail.value = `${product.brand || ''} | ${product.specification || ''} | ${product.categoryName || ''}`
  }
}

// 文件上传
const handleFileChange: UploadProps['onChange'] = (uploadFile) => {
  portraitForm.salesFile = uploadFile.raw as File
}

// 生成画像分析
const handleGeneratePortrait = async () => {
  portraitFormRef.value?.validate(async (valid) => {
    if (valid) {
      generating.value = true
      try {
        const formData = new FormData()
        formData.append('productId', portraitForm.productId)
        formData.append('dimensions', portraitForm.dimensions.join(','))
        formData.append('aiModel', portraitForm.aiModel)
        formData.append('enableSearch', portraitForm.enableSearch ? '1' : '0')
        if (portraitForm.salesFile) {
          formData.append('salesFile', portraitForm.salesFile)
        }

        const response = await distributorApi.createDistProfile(currentDistributor.value.id, formData)
        ElMessage.success('画像分析任务已创建，正在分析中...')
        portraitFormVisible.value = false

        // 轮询查询结果
        pollProfileResult(response.taskId)
      } catch (error) {
        ElMessage.error('创建分析任务失败')
      } finally {
        generating.value = false
      }
    }
  })
}

const pollProfileResult = async (taskId: string) => {
  const interval = setInterval(async () => {
    try {
      const result = await distributorApi.getProfileResult(taskId)
      if (result.status === 'completed') {
        clearInterval(interval)
        ElMessage.success('画像分析完成')
        await loadDistributors()
      } else if (result.status === 'failed') {
        clearInterval(interval)
        ElMessage.error('分析失败：' + result.error)
      }
    } catch (error) {
      clearInterval(interval)
    }
  }, 3000)
}

// 查看报告
const handleViewReport = async (report: any) => {
  try {
    const detail = await distributorApi.getProfileById(report.id)
    currentReport.value = detail
    reportPreviewVisible.value = true
  } catch (error) {
    ElMessage.error('获取报告详情失败')
  }
}

// 删除报告
const handleDeleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该画像分析报告吗？', '提示', { type: 'warning' })
    // 这里需要删除API，暂时使用模拟
    ElMessage.success('删除成功')
    await loadDistributors()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

// 下载报告
const handleDownloadReport = () => {
  ElMessage.success('报告下载中，请稍候...')
  reportPreviewVisible.value = false
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadDistributors()
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
  filterForm.manager = ''
  pagination.page = 1
  loadDistributors()
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadDistributors()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadDistributors()
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
    pending: '待分析'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  loadDistributors()
})
</script>

<style scoped lang="scss">
.distributor-portrait {
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

  .portrait-list {
    .no-data { padding: 40px 0; }

    .distributor-card {
      margin-bottom: 20px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 20px;
      background: #fff;

      .distributor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ebeef5;

        .distributor-info {
          flex: 1;

          h4 {
            margin: 0 0 10px 0;
            color: #303133;
            font-size: 16px;
          }

          p {
            margin: 5px 0;
            color: #909399;
            font-size: 13px;
          }
        }

        .distributor-stats {
          display: flex;
          gap: 30px;

          .stat-item {
            text-align: center;

            .label {
              display: block;
              color: #909399;
              font-size: 12px;
              margin-bottom: 5px;
            }

            .value {
              display: block;
              color: #409eff;
              font-size: 20px;
              font-weight: bold;
            }
          }
        }

        .distributor-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-end;
        }
      }

      .no-reports {
        padding: 20px 0;
        text-align: center;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .products-content {
    .distributor-summary {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;

      h4 {
        margin: 0 0 10px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 13px;
      }
    }
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }

  .report-preview {
    .report-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0 0 10px 0;
        color: #303133;
      }

      .report-meta {
        margin: 0;
        color: #909399;
        font-size: 13px;
      }
    }

    .report-content {
      margin-top: 20px;
    }
  }
}
</style>
