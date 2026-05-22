<template>
  <div class="product-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>产品列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建产品
        </el-button>
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 顶部数据看板 -->
    <div class="data-board">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">总产品数量</div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-trend">{{ stats.momRate }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">未上架产品</div>
            <div class="stat-value">{{ stats.offShelf }}</div>
            <div class="stat-desc">待上架</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">已上架产品</div>
            <div class="stat-value">{{ stats.onShelf }}</div>
            <div class="stat-desc">上架率 {{ calculateShelfRate() }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">今日新增</div>
            <div class="stat-value">+3</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="产品类别">
          <el-select v-model="filterForm.categoryId" placeholder="请选择" clearable>
            <el-option
              v-for="type in productTypes"
              :key="type.id"
              :label="type.typeName"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="filterForm.brandId" placeholder="请选择" clearable>
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.brandName"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="filterForm.keyword" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable>
            <el-option label="全部" :value="null" />
            <el-option label="已上架" :value="1" />
            <el-option label="未上架" :value="0" />
          </el-select>
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
        <el-table-column prop="name" label="产品名称" min-width="180" />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />
        <el-table-column prop="spec" label="规格/型号" width="120" />
        <el-table-column prop="detailContent" label="产品详情" min-width="200" show-overflow-tooltip />
        <el-table-column label="产品说明书" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.manualFileUrl"
              link
              type="primary"
              @click="handleViewFile(row.manualFileUrl)"
            >
              查看说明书
            </el-button>
            <span v-else class="text-muted">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="产品状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已上架' : '未上架' }}
            </el-tag>
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

    <!-- 新建/编辑产品弹窗 -->
    <el-dialog
      v-model="productFormVisible"
      :title="isEdit ? '编辑产品' : '新建产品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="120px">
        <el-form-item label="产品类别" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择产品类别">
            <el-option
              v-for="type in productTypes"
              :key="type.id"
              :label="type.typeName"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="productForm.brandId" placeholder="请选择品牌">
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.brandName"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品SKU" prop="skuCode">
          <el-input v-model="productForm.skuCode" placeholder="请输入产品SKU" />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="规格/型号" prop="spec">
          <el-input v-model="productForm.spec" placeholder="请输入规格/型号" />
        </el-form-item>
        <el-form-item label="产品详情">
          <el-input
            v-model="productForm.detailContent"
            type="textarea"
            :rows="3"
            placeholder="请输入产品详情"
          />
        </el-form-item>
        <el-form-item label="产品详情文件">
          <el-upload
            :auto-upload="false"
            :on-change="handleDetailFileChange"
            :file-list="detailFileList"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品说明书">
          <el-upload
            :auto-upload="false"
            :on-change="handleManualFileChange"
            :file-list="manualFileList"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio :value="1">已上架</el-radio>
            <el-radio :value="0">未上架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProduct" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus'
import * as productApi from '@/api/products'
import * as baseDataApi from '@/api/base-data'

// 统计数据
const stats = reactive({
  total: 0,
  onShelf: 0,
  offShelf: 0,
  momRate: '+0%'
})

// 产品类型和品牌数据
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])

// 筛选表单
const filterForm = reactive({
  categoryId: undefined as number | undefined,
  brandId: undefined as number | undefined,
  keyword: '',
  status: undefined as number | undefined
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

// 产品表单
const productFormVisible = ref(false)
const isEdit = ref(false)
const productFormRef = ref<FormInstance>()
const productForm = reactive({
  id: undefined as number | undefined,
  categoryId: undefined,
  brandId: undefined,
  skuCode: '',
  name: '',
  spec: '',
  detailContent: '',
  status: 1
})

const productRules: FormRules = {
  categoryId: [{ required: true, message: '请选择产品类别', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  skuCode: [{ required: true, message: '请输入产品SKU', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入规格/型号', trigger: 'blur' }]
}

// 文件上传
const detailFileList = ref<UploadUserFile[]>([])
const manualFileList = ref<UploadUserFile[]>([])
const saving = ref(false)

// 计算上架率
const calculateShelfRate = () => {
  if (stats.total === 0) return 0
  return ((stats.onShelf / stats.total) * 100).toFixed(1)
}

// 加载产品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    }

    const response: any = await productApi.getProducts(params)

    // 更新统计数据（从响应中获取）
    if (response.stats) {
      stats.total = response.stats.total || 0
      stats.onShelf = response.stats.onShelf || 0
      stats.offShelf = response.stats.offShelf || 0
      stats.momRate = response.stats.momRate || '+0%'
    }

    // 更新列表数据 (适配 VIA_DTO 模式，Page 对象现在作为 page 字段返回)
    if (response.page) {
      tableData.value = response.page.content || []
      pagination.total = response.page.totalElements || 0
    } else {
      // 兼容旧格式或无包装格式
      tableData.value = response.list || response.content || []
      pagination.total = response.total || response.totalElements || 0
    }
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadProducts()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    categoryId: undefined,
    brandId: undefined,
    keyword: '',
    status: undefined
  })
  pagination.page = 1
  loadProducts()
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadProducts()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadProducts()
}

// 新建产品
const handleAdd = () => {
  isEdit.value = false
  Object.assign(productForm, {
    categoryId: undefined,
    brandId: undefined,
    skuCode: '',
    name: '',
    spec: '',
    detailContent: '',
    status: 1
  })
  detailFileList.value = []
  manualFileList.value = []
  productFormVisible.value = true
}

// 编辑产品
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(productForm, row)
  productFormVisible.value = true
}

// 删除产品
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除产品"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await productApi.deleteProduct(row.id)
      ElMessage.success('删除成功')
      loadProducts()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 保存产品
const handleSaveProduct = async () => {
  productFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const formData = new FormData()
        formData.append('productData', JSON.stringify(productForm))

        if (detailFileList.value.length > 0) {
          formData.append('detailFile', detailFileList.value[0].raw!)
        }
        if (manualFileList.value.length > 0) {
          formData.append('manualFile', manualFileList.value[0].raw!)
        }

        if (isEdit.value) {
          await productApi.updateProduct(productForm.id!, formData)
          ElMessage.success('更新成功')
        } else {
          await productApi.createProduct(formData)
          ElMessage.success('创建成功')
        }

        productFormVisible.value = false
        await loadProducts()
      } catch (error) {
        console.error('保存产品失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 文件变化处理
const handleDetailFileChange: UploadProps['onChange'] = (uploadFile) => {
  detailFileList.value = [uploadFile]
}

const handleManualFileChange: UploadProps['onChange'] = (uploadFile) => {
  manualFileList.value = [uploadFile]
}

// 查看文件
const handleViewFile = (url: string) => {
  window.open(url, '_blank')
}

// 导出数据
const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}

// 加载产品类型
const loadProductTypes = async () => {
  try {
    productTypes.value = await baseDataApi.productTypes.getAll()
  } catch (error) {
    console.error('加载产品类型失败:', error)
  }
}

// 加载品牌
const loadBrands = async () => {
  try {
    brands.value = await baseDataApi.brands.getAll()
  } catch (error) {
    console.error('加载品牌失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadProducts()
  loadProductTypes()
  loadBrands()
})
</script>

<style scoped lang="scss">
.product-list {
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

      .stat-title {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .stat-trend {
        font-size: 12px;
        opacity: 0.8;

        &.up {
          color: #67c23a;
        }
      }

      .stat-desc {
        font-size: 12px;
        opacity: 0.8;
      }
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

  .text-muted {
    color: #909399;
  }
}
</style>
