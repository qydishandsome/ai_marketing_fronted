<template>
  <div class="user-list">
    <div class="page-header">
      <h3>用户列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="所属部门">
          <el-select v-model="filterForm.deptId" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.deptName"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-section">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="realName" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="groupId" label="所属用户组" width="120">
          <template #default="{ row }">
            {{ getGroupName(row.groupId) }}
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="所属部门" width="120">
          <template #default="{ row }">
            {{ getDeptName(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
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

    <el-dialog v-model="userFormVisible" :title="isEdit ? '编辑用户' : '新建用户'" width="600px" :close-on-click-modal="false">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="140px">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入11位手机号"
            maxlength="11"
            show-word-limit
            @input="handlePhoneInput"
          />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="userForm.deptId" placeholder="请选择部门" style="width: 100%">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.deptName"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属用户组" prop="groupId">
          <el-select v-model="userForm.groupId" placeholder="请选择用户组" style="width: 100%">
            <el-option
              v-for="group in userGroups"
              :key="group.id"
              :label="group.groupName"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="默认密码">
          <el-input value="123456" disabled />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">新建用户默认密码为123456</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser" :loading="saving">保存</el-button>
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

const filterForm = reactive({ deptId: null as number | null })
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const userFormVisible = ref(false)
const isEdit = ref(false)
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  realName: '',
  phone: '',
  deptId: null as number | null,
  groupId: null as number | null,
  status: 1
})

const userRules: FormRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  groupId: [{ required: true, message: '请选择用户组', trigger: 'change' }]
}

const saving = ref(false)

// 下拉选项数据
const departments = ref<any[]>([])
const userGroups = ref<any[]>([])

const loadUsers = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page - 1,
      size: pagination.size
    }
    if (filterForm.deptId) {
      params.deptId = filterForm.deptId
    }

    const response = await systemApi.users.getList(params)
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    departments.value = await systemApi.departments.getAll()
  } catch (error) {
    console.error('加载部门列表失败:', error)
  }
}

const loadUserGroups = async () => {
  try {
    const response = await systemApi.userGroups.getList({ page: 0, size: 100 })
    userGroups.value = response.content || []
  } catch (error) {
    console.error('加载用户组列表失败:', error)
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadUsers()
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadUsers()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadUsers()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(userForm, { realName: '', phone: '', deptId: null, groupId: null, status: 1 })
  // 重置表单验证
  userFormRef.value?.clearValidate()
  userFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(userForm, row)
  // 重置表单验证
  userFormRef.value?.clearValidate()
  userFormVisible.value = true
}

const handlePhoneInput = (value: string) => {
  // 只允许输入数字
  userForm.phone = value.replace(/\D/g, '')
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '提示', { type: 'warning' })
    await systemApi.users.delete(row.id)
    ElMessage.success('删除成功')
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveUser = () => {
  console.log('保存用户数据:', userForm)
  console.log('手机号值:', userForm.phone, '类型:', typeof userForm.phone)

  userFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await systemApi.users.update(userForm.id!, userForm)
          ElMessage.success('更新成功')
        } else {
          await systemApi.users.create(userForm)
          ElMessage.success('创建成功')
        }
        userFormVisible.value = false
        await loadUsers() // 等待加载完成
      } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    } else {
      console.log('表单验证失败')
    }
  })
}

const getGroupName = (groupId: number) => {
  const group = userGroups.value.find(g => g.id === groupId)
  return group ? group.groupName : '-'
}

const getDeptName = (deptId: number) => {
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? dept.deptName : '-'
}

const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

const getStatusText = (status: number) => {
  return status === 1 ? '正常' : '停用'
}

onMounted(() => {
  loadUsers()
  loadDepartments()
  loadUserGroups()
})
</script>

<style scoped lang="scss">
.user-list {
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
