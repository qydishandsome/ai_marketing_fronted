<template>
  <div class="product-type-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>产品类型列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建产品类型
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="产品类型">
          <el-input v-model="filterForm.keyword" placeholder="请输入产品类型" />
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
        <el-table-column prop="typeName" label="类型名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="产品数量" width="100">
          <template #default="{ row }">
            {{ row.productCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
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

    <!-- 新建/编辑产品类型弹窗 -->
    <el-dialog
      v-model="typeFormVisible"
      :title="isEdit ? '编辑产品类型' : '新建产品类型'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="120px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="typeForm.typeName" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="typeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveType" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
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

// 产品类型表单
const typeFormVisible = ref(false)
const isEdit = ref(false)
const typeFormRef = ref<FormInstance>()
const typeForm = reactive({
  typeName: '',
  description: ''
})

const typeRules: FormRules = {
  typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }]
}

const saving = ref(false)

// 加载产品类型列表
const loadProductTypes = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    }

    const response = await baseDataApi.productTypes.getList(params)

    // 后端返回的是Page对象
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    console.error('加载产品类型列表失败:', error)
    ElMessage.error('加载产品类型列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadProductTypes()
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
  pagination.page = 1
  loadProductTypes()
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadProductTypes()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadProductTypes()
}

// 新建产品类型
const handleAdd = () => {
  isEdit.value = false
  Object.assign(typeForm, {
    typeName: '',
    description: ''
  })
  typeFormVisible.value = true
}

// 编辑产品类型
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(typeForm, row)
  typeFormVisible.value = true
}

// 删除产品类型
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除产品类型"${row.typeName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await baseDataApi.productTypes.delete(row.id)
      ElMessage.success('删除成功')
      loadProductTypes()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 保存产品类型
const handleSaveType = async () => {
  typeFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await baseDataApi.productTypes.update(typeForm.id!, typeForm)
          ElMessage.success('更新成功')
        } else {
          await baseDataApi.productTypes.create(typeForm)
          ElMessage.success('创建成功')
        }

        typeFormVisible.value = false
        loadProductTypes()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadProductTypes()
})
</script>

<style scoped lang="scss">
.product-type-list {
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
}
</style>
