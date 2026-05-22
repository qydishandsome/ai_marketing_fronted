<template>
  <div class="audience-list">
    <div class="page-header">
      <h3>新品爆款预测人群列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建人群类型
        </el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="人群类型">
          <el-input v-model="filterForm.keyword" placeholder="请输入人群类型" />
        </el-form-item>
        <el-form-item label="使用次数排序">
          <el-select v-model="filterForm.useCountOrder" placeholder="请选择" clearable>
            <el-option label="从高到低" value="desc" />
            <el-option label="从低到高" value="asc" />
          </el-select>
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
        <el-table-column prop="audienceName" label="人群类型" width="150" />
        <el-table-column prop="description" label="类型描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="useCount" label="使用次数" width="100" sortable />
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

    <el-dialog v-model="audienceFormVisible" :title="isEdit ? '编辑人群类型' : '新建人群类型'" width="500px" :close-on-click-modal="false">
      <el-form :model="audienceForm" :rules="audienceRules" ref="audienceFormRef" label-width="140px">
        <el-form-item label="人群类型名称" prop="audienceName">
          <el-input v-model="audienceForm.audienceName" placeholder="请输入人群类型名称" />
        </el-form-item>
        <el-form-item label="人群类型描述" prop="description">
          <el-input v-model="audienceForm.description" type="textarea" :rows="3" placeholder="请输入人群类型描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="audienceFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAudience" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as businessApi from '@/api/business'

const filterForm = reactive({ keyword: '', useCountOrder: '' })
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const audienceFormVisible = ref(false)
const isEdit = ref(false)
const audienceFormRef = ref<FormInstance>()
const audienceForm = reactive({ audienceName: '', description: '' })
const audienceRules: FormRules = {
  audienceName: [{ required: true, message: '请输入人群类型名称', trigger: 'blur' }]
}
const saving = ref(false)

const loadAudiences = async () => {
  loading.value = true
  try {
    const response = await businessApi.audiences.getList({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    // 处理不同的响应结构
    const content = response.content || response.list || []
    tableData.value = content
    pagination.total = response.totalElements || response.total || 0

    if (tableData.value.length === 0 && pagination.total === 0) {
      console.warn('爆款预测人群列表为空，请检查后端数据')
    }
  } catch (error) {
    console.error('加载人群列表失败:', error)
    ElMessage.error('加载人群列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => { pagination.page = 1; loadAudiences() }
const handleReset = () => { filterForm.keyword = ''; filterForm.useCountOrder = ''; pagination.page = 1; loadAudiences() }
const handleSizeChange = (val: number) => { pagination.size = val; loadAudiences() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadAudiences() }

const handleAdd = () => {
  isEdit.value = false
  Object.assign(audienceForm, { audienceName: '', description: '' })
  audienceFormRef.value?.clearValidate()
  audienceFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(audienceForm, row)
  audienceFormRef.value?.clearValidate()
  audienceFormVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除人群类型"${row.audienceName}"吗？`, '提示', { type: 'warning' })
    await businessApi.audiences.delete(row.id)
    ElMessage.success('删除成功')
    await loadAudiences()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSaveAudience = () => {
  audienceFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await businessApi.audiences.update(audienceForm.id!, audienceForm)
          ElMessage.success('更新成功')
        } else {
          await businessApi.audiences.create(audienceForm)
          ElMessage.success('创建成功')
        }
        audienceFormVisible.value = false
        await loadAudiences()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

onMounted(() => { loadAudiences() })
</script>

<style scoped lang="scss">
.audience-list {
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
