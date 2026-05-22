<template>
  <div class="brand-list">
    <div class="page-header">
      <h3>品牌列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建品牌
        </el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="品牌名称">
          <el-input v-model="filterForm.keyword" placeholder="请输入品牌名称" />
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
        <el-table-column prop="brandName" label="品牌名称" min-width="150" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="spec" label="规格/型号" min-width="200" show-overflow-tooltip />
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

    <el-dialog v-model="brandFormVisible" :title="isEdit ? '编辑品牌' : '新建品牌'" width="500px" :close-on-click-modal="false">
      <el-form :model="brandForm" :rules="brandRules" ref="brandFormRef" label-width="120px">
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="brandForm.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="brandForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="规格/型号">
          <el-input v-model="brandForm.spec" type="textarea" :rows="3" placeholder="请输入规格/型号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="brandFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBrand" :loading="saving">保存</el-button>
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

const filterForm = reactive({ keyword: '' })
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const brandFormVisible = ref(false)
const isEdit = ref(false)
const brandFormRef = ref<FormInstance>()
const brandForm = reactive({ brandName: '', productName: '', spec: '' })
const brandRules: FormRules = { brandName: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }] }
const saving = ref(false)

const loadBrands = async () => {
  loading.value = true
  try {
    const response = await baseDataApi.brands.getList({ ...filterForm, page: pagination.page - 1, size: pagination.size })
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    ElMessage.error('加载品牌列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => { pagination.page = 1; loadBrands() }
const handleReset = () => { filterForm.keyword = ''; pagination.page = 1; loadBrands() }
const handleSizeChange = (val: number) => { pagination.size = val; loadBrands() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadBrands() }

const handleAdd = () => {
  isEdit.value = false
  Object.assign(brandForm, { brandName: '', productName: '', spec: '' })
  // 重置表单验证
  brandFormRef.value?.clearValidate()
  brandFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(brandForm, row)
  // 重置表单验证
  brandFormRef.value?.clearValidate()
  brandFormVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除品牌"${row.brandName}"吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await baseDataApi.brands.delete(row.id)
      ElMessage.success('删除成功')
      loadBrands()
    }).catch(() => {})
}

const handleSaveBrand = () => {
  brandFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        console.log('保存品牌数据:', brandForm)

        if (isEdit.value) {
          await baseDataApi.brands.update(brandForm.id!, brandForm)
          ElMessage.success('更新成功')
        } else {
          await baseDataApi.brands.create(brandForm)
          ElMessage.success('创建成功')
        }

        brandFormVisible.value = false
        await loadBrands() // 等待加载完成
      } catch (error) {
        console.error('保存品牌失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    } else {
      console.log('表单验证失败')
    }
  })
}

onMounted(() => { loadBrands() })
</script>

<style scoped lang="scss">
.brand-list {
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
}
</style>
