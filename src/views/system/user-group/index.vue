<template>
  <div class="user-group-list">
    <div class="page-header">
      <h3>用户组列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建用户组
        </el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="groupName" label="用户组名称" min-width="150" />
        <el-table-column prop="permissions" label="权限简述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
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

    <el-dialog v-model="groupFormVisible" :title="isEdit ? '编辑用户组' : '新建用户组'" width="600px" :close-on-click-modal="false">
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="140px">
        <el-form-item label="用户组名称" prop="groupName">
          <el-input v-model="groupForm.groupName" placeholder="请输入用户组名称" />
        </el-form-item>
        <el-form-item label="权限设置" prop="permissions">
          <el-checkbox-group v-model="selectedPermissions">
            <el-checkbox label="查看" />
            <el-checkbox label="创建" />
            <el-checkbox label="编辑" />
            <el-checkbox label="删除" />
            <el-checkbox label="管理所有" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="用户组状态" prop="status">
          <el-radio-group v-model="groupForm.status">
            <el-radio :value="1">活跃</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveGroup" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as systemApi from '@/api/system'

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const groupFormVisible = ref(false)
const isEdit = ref(false)
const groupFormRef = ref<FormInstance>()
const groupForm = reactive({
  groupName: '',
  permissions: '',
  status: 1
})
const selectedPermissions = ref<string[]>([])

const groupRules: FormRules = {
  groupName: [{ required: true, message: '请输入用户组名称', trigger: 'blur' }],
  permissions: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (selectedPermissions.value.length === 0) {
          callback(new Error('请选择权限'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const saving = ref(false)

const loadUserGroups = async () => {
  loading.value = true
  try {
    const response = await systemApi.userGroups.getList({
      page: pagination.page - 1,
      size: pagination.size
    })
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    ElMessage.error('加载用户组列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadUserGroups()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadUserGroups()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(groupForm, { groupName: '', permissions: '', status: 1 })
  selectedPermissions.value = []
  // 重置表单验证
  groupFormRef.value?.clearValidate()
  groupFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(groupForm, row)
  // 解析权限
  try {
    const perms = JSON.parse(row.permissions || '{}')
    selectedPermissions.value = perms.role ? [perms.role] : []
  } catch {
    selectedPermissions.value = []
  }
  // 重置表单验证
  groupFormRef.value?.clearValidate()
  groupFormVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户组"${row.groupName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await systemApi.userGroups.delete(row.id)
    ElMessage.success('删除成功')
    await loadUserGroups() // 等待加载完成
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户组失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveGroup = () => {
  console.log('保存用户组数据:', groupForm)
  console.log('选中的权限:', selectedPermissions.value)

  groupFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        // 将权限数组转换为字符串
        groupForm.permissions = selectedPermissions.value.join(',')

        console.log('准备保存的用户组数据:', groupForm)

        if (isEdit.value) {
          await systemApi.userGroups.update(groupForm.id!, groupForm)
          ElMessage.success('更新成功')
        } else {
          await systemApi.userGroups.create(groupForm)
          ElMessage.success('创建成功')
        }

        groupFormVisible.value = false
        await loadUserGroups() // 等待加载完成
      } catch (error) {
        console.error('保存用户组失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    } else {
      console.log('表单验证失败')
    }
  })
}

const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

const getStatusText = (status: number) => {
  return status === 1 ? '活跃' : '停用'
}

onMounted(() => { loadUserGroups() })
</script>

<style scoped lang="scss">
.user-group-list {
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

  .table-section {
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }
}
</style>
