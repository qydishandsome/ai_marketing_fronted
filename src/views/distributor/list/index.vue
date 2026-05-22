<template>
  <div class="distributor-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>分销商列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建分销商
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分销商名称">
          <el-input v-model="filterForm.keyword" placeholder="请输入分销商名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="distName" label="分销商名称" min-width="180" />
        <el-table-column prop="shopName" label="店铺名称" min-width="150" />
        <el-table-column prop="managerName" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="enterpriseScale" label="企业规模" width="120" />
        <el-table-column prop="registeredCapital" label="注册资本(万)" width="120" />
        <el-table-column label="代理产品" min-width="150">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleViewProducts(row)"
            >
              查看代理产品 ({{ row.productCount || 0 }})
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
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

    <!-- 新建/编辑分销商弹窗 -->
    <el-dialog
      v-model="distributorFormVisible"
      :title="isEdit ? '编辑分销商' : '新建分销商'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="distributorForm" :rules="distributorRules" ref="distributorFormRef" label-width="120px">
        <el-form-item label="分销商名称" prop="distName">
          <el-input v-model="distributorForm.distName" placeholder="请输入分销商名称" />
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="distributorForm.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="managerName">
          <el-input v-model="distributorForm.managerName" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="distributorForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="营业执照">
          <el-upload
            :auto-upload="false"
            :on-change="handleLicenseChange"
            :file-list="licenseFileList"
            :limit="1"
          >
            <el-button type="primary">上传营业执照</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="企业规模">
          <el-select v-model="distributorForm.enterpriseScale" placeholder="请选择企业规模" style="width: 100%">
            <el-option label="微型企业(<10人)" value="微型企业" />
            <el-option label="小型企业(10-50人)" value="小型企业" />
            <el-option label="中型企业(50-300人)" value="中型企业" />
            <el-option label="大型企业(>300人)" value="大型企业" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册资本">
          <el-input v-model="distributorForm.registeredCapital" placeholder="请输入注册资本" />
        </el-form-item>
        <el-form-item label="代理产品" prop="agentProductIds">
          <el-select
            v-model="distributorForm.agentProductIds"
            multiple
            placeholder="请选择代理产品"
            style="width: 100%"
          >
            <el-option
              v-for="product in allProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="distributorFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDistributor" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 代理产品列表弹窗 -->
    <el-dialog
      v-model="productsDialogVisible"
      title="代理产品列表"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="products-content">
        <h4>{{ currentDistributor.distName }} 的代理产品</h4>
        <el-table
          :data="distributorProducts"
          border
          stripe
          style="width: 100%; margin-top: 15px"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="产品名称" min-width="150" />
          <el-table-column prop="skuCode" label="SKU编码" width="150" />
          <el-table-column prop="categoryName" label="产品类别" width="120" />
          <el-table-column prop="brandName" label="品牌" width="120" />
          <el-table-column prop="spec" label="规格" width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="productsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus'
import * as distributorApi from '@/api/distributors'
import * as productApi from '@/api/products'
import * as baseDataApi from '@/api/base-data'

// 筛选表单
const filterForm = reactive({
  keyword: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 分销商表单
const distributorFormVisible = ref(false)
const isEdit = ref(false)
const distributorFormRef = ref<FormInstance>()
const distributorForm = reactive({
  distName: '',
  shopName: '',
  managerName: '',
  phone: '',
  licenseUrl: '',
  enterpriseScale: '',
  registeredCapital: '',
  agentProductIds: [] as number[],
  id: undefined as number | undefined
})

const distributorRules: FormRules = {
  distName: [{ required: true, message: '请输入分销商名称', trigger: 'blur' }],
  shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  managerName: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  agentProductIds: [{ required: true, message: '请选择代理产品', trigger: 'change' }]
}

// 文件上传
const licenseFileList = ref<UploadUserFile[]>([])
const saving = ref(false)

// 产品相关
const allProducts = ref<any[]>([])

// 代理产品弹窗
const productsDialogVisible = ref(false)
const currentDistributor = ref<any>({})
const distributorProducts = ref<any[]>([])
// 基础数据缓存
const brands = ref<any[]>([])
const categories = ref<any[]>([])

// 加载分销商列表
const loadDistributors = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    }

    const response = await distributorApi.getDistributors(params)

    // 后端返回的是Page对象
    const rawList = response.content || []
    
    // 关键修复：由于后端实体类没有 productCount 字段，前端在加载列表时批量获取每个分销商的产品总数
    tableData.value = await Promise.all(rawList.map(async (dist: any) => {
      try {
        const products = await distributorApi.getDistributorProducts(dist.id)
        return {
          ...dist,
          productCount: products ? (products as any).length : 0
        }
      } catch (e) {
        return { ...dist, productCount: 0 }
      }
    }))
    
    pagination.total = response.totalElements || 0
  } catch (error) {
    console.error('加载分销商列表失败:', error)
    ElMessage.error('加载分销商列表失败')
  } finally {
    loading.value = false
  }
}

// 加载所有产品
const loadAllProducts = async () => {
  try {
    console.log('开始加载全量产品列表...')
    const response = await productApi.getProducts({ page: 0, size: 1000 })
    console.log('产品接口原始响应:', response)
    
    // 关键修正：后端 ProductController.list 返回的是 { stats: ..., page: { content: [], ... } }
    if (response && (response as any).page && (response as any).page.content) {
      allProducts.value = (response as any).page.content
    } else if (response && (response as any).list) {
      allProducts.value = (response as any).list
    } else if (Array.isArray(response)) {
      allProducts.value = response
    } else {
      allProducts.value = []
    }
    console.log('解析后的产品列表:', allProducts.value)
  } catch (error) {
    console.error('加载产品列表失败:', error)
  }
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadDistributors()
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
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

// 新建分销商
const handleAdd = () => {
  isEdit.value = false
  Object.assign(distributorForm, {
    distName: '',
    shopName: '',
    managerName: '',
    phone: '',
    licenseUrl: '',
    enterpriseScale: '',
    registeredCapital: '',
    agentProductIds: []
  })
  licenseFileList.value = []
  
  // 确保产品全表数据已就绪
  if (allProducts.value.length === 0) {
    loadAllProducts()
  }
  
  distributorFormVisible.value = true
}

// 编辑分销商
const handleEdit = async (row: any) => {
  isEdit.value = true
  Object.assign(distributorForm, row)
  
  // 关键修复：编辑时从 API 获取最新的代理产品 ID 列表，因为列表接口可能没返回这些 ID
  try {
    const products = await distributorApi.getDistributorProducts(row.id)
    distributorForm.agentProductIds = products.map((p: any) => p.id)
  } catch (error) {
    console.error('获取分销商产品失败:', error)
    distributorForm.agentProductIds = []
  }
  
  // 确保产品全表数据已就绪
  if (allProducts.value.length === 0) {
    await loadAllProducts()
  }
  
  distributorFormVisible.value = true
}

// 删除分销商
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分销商"${row.distName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await distributorApi.deleteDistributor(row.id)
      ElMessage.success('删除成功')
      loadDistributors()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 保存分销商
const handleSaveDistributor = async () => {
  distributorFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const { id, ...pureData } = distributorForm
        const dataToSend = {
          distributor: pureData,
          agentProductIds: distributorForm.agentProductIds
        }

        if (isEdit.value) {
          await distributorApi.updateDistributor(distributorForm.id!, dataToSend)
          ElMessage.success('更新成功')
        } else {
          await distributorApi.createDistributor(dataToSend)
          ElMessage.success('创建成功')
        }

        distributorFormVisible.value = false
        loadDistributors()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 文件变化处理
const handleLicenseChange: UploadProps['onChange'] = (uploadFile) => {
  licenseFileList.value = [uploadFile]
}

// 查看代理产品
const handleViewProducts = async (row: any) => {
  currentDistributor.value = row
  try {
    const products = await distributorApi.getDistributorProducts(row.id)

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
    distributorProducts.value = products.map((product: any) => ({
      ...product,
      categoryName: categories.value.find((c: any) => c.id === product.categoryId)?.typeName || '',
      brandName: brands.value.find((b: any) => b.id === product.brandId)?.brandName || '',
      spec: product.spec || product.specification || ''
    }))

    productsDialogVisible.value = true
  } catch (error) {
    console.error('加载代理产品失败:', error)
    ElMessage.error('加载代理产品失败')
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}

// 页面加载时获取数据
onMounted(() => {
  loadDistributors()
  loadAllProducts()
})
</script>

<style scoped lang="scss">
.distributor-list {
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

  .products-content {
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 16px;
    }
  }
}
</style>
