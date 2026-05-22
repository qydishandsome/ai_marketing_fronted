<template>
  <div class="cooperation-list">
    <div class="page-header">
      <h3>合作项目列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建合作
        </el-button>
      </div>
    </div>

    <div class="data-board">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">总项目数量</div>
            <div class="stat-value">{{ stats.total || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">合作达人数量</div>
            <div class="stat-value">{{ stats.kolCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">合作费用总额</div>
            <div class="stat-value">¥{{ stats.totalFee || 0 }}万</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="table-section">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="projectName" label="项目名称" min-width="150" />
        <el-table-column prop="productId" label="产品信息" width="150">
          <template #default="{ row }">
            {{ getProductName(row.productId) }}
          </template>
        </el-table-column>
        <el-table-column prop="kolId" label="达人信息" width="120">
          <template #default="{ row }">
            {{ getKolName(row.kolId) }}
          </template>
        </el-table-column>
        <el-table-column prop="managerName" label="负责人" width="100" />
        <el-table-column prop="coopFormsJson" label="合作形式" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatCoopForms(row.coopFormsJson) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="合作费用" width="100">
          <template #default="{ row }">
            ¥{{ getFeeValue(row.feesJson) || row.fee || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束时间" width="120" />
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

    <el-dialog v-model="cooperationFormVisible" :title="isEdit ? '编辑合作' : '新建合作'" width="700px" :close-on-click-modal="false">
      <el-form :model="cooperationForm" :rules="cooperationRules" ref="cooperationFormRef" label-width="140px">
        <el-form-item label="合作项目名称" prop="projectName">
          <el-input v-model="cooperationForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="达人" prop="kolId">
          <el-select v-model="cooperationForm.kolId" placeholder="请选择达人" filterable style="width: 100%">
            <el-option
              v-for="kol in kolList"
              :key="kol.id"
              :label="kol.name"
              :value="kol.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合作形式" prop="coopType">
          <el-checkbox-group v-model="cooperationTypes">
            <el-checkbox label="抖音短视频推广" value="抖音短视频推广" />
            <el-checkbox label="直播带货" value="直播带货" />
            <el-checkbox label="小红书种草笔记" value="小红书种草笔记" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="关联产品" prop="productId">
          <el-select v-model="cooperationForm.productId" placeholder="请选择产品" style="width: 100%">
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="managerName">
          <el-input v-model="cooperationForm.managerName" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="cooperationForm.startTime" type="date" placeholder="选择开始时间" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="cooperationForm.endTime" type="date" placeholder="选择结束时间" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="合作费用 (元)" prop="fee">
          <el-input-number v-model="cooperationForm.fee" :min="0" placeholder="请输入合作费用" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合同文件" prop="contractUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleContractChange"
            :limit="1"
            :file-list="contractFileList"
          >
            <el-button type="primary">点击上传合同文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传pdf、doc、docx、jpg、png格式的文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cooperationFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCooperation" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as kolApi from '@/api/kols'
import * as productApi from '@/api/products'
import * as cooperationApi from '@/api/cooperation'

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })
const stats = reactive({ total: 0, kolCount: 0, totalFee: 0 })

const cooperationFormVisible = ref(false)
const isEdit = ref(false)
const cooperationFormRef = ref<FormInstance>()
const cooperationForm = reactive({
  id: undefined as number | undefined,
  projectName: '',
  kolId: null as number | null,
  productId: null as number | null,
  managerName: '',
  startTime: '',
  endTime: '',
  fee: 0,
  contractUrl: ''
})
const cooperationTypes = ref<string[]>([])
const saving = ref(false)
const kolList = ref<any[]>([])
const productList = ref<any[]>([])
const contractFileList = ref<any[]>([])

const cooperationRules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  kolId: [{ required: true, message: '请选择达人', trigger: 'change' }],
  managerName: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const loadCooperations = async () => {
  loading.value = true
  try {
    const response: any = await cooperationApi.getCooperations({
      page: pagination.page - 1,
      size: pagination.size
    })
    // 适配 Spring Data VIA_DTO 模式，数据在 response.content 中
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0

    // 更新统计数据（调用专门的统计接口获取真实数据）
    try {
      const statsRes: any = await cooperationApi.getStats()
      stats.total = statsRes.total || 0
      stats.kolCount = statsRes.kolCount || 0
      // 后端返回的是元，前端显示的是“万”，进行转换
      stats.totalFee = statsRes.totalFees ? Number((statsRes.totalFees / 10000).toFixed(2)) : 0
    } catch (e) {
      console.error('加载统计数据失败:', e)
    }
  } catch (error) {
    ElMessage.error('加载合作项目列表失败')
  } finally {
    loading.value = false
  }
}

const loadKols = async () => {
  try {
    const response: any = await kolApi.getKols({ page: 0, size: 1000 })
    kolList.value = response.content || []
  } catch (error) {
    console.error('加载达人列表失败:', error)
  }
}

const loadProducts = async () => {
  try {
    const res = await productApi.getProducts({ page: 0, size: 1000 })
    // 后端返回结构是 { stats: {...}, page: { content: [...] } }
    const pageData = res.page || res
    productList.value = pageData.content || pageData.list || []
  } catch (error) {
    console.error('加载产品失败:', error)
  }
}

const getKolName = (id: number) => {
  const kol = kolList.value.find(k => k.id === id)
  return kol ? kol.name : id
}

const getProductName = (id: number) => {
  const prod = productList.value.find(p => p.id === id)
  return prod ? prod.name : id
}

const formatCoopForms = (json: string) => {
  if (!json) return '-'
  try {
    const arr = JSON.parse(json)
    return Array.isArray(arr) ? arr.join(', ') : json
  } catch (e) {
    return json
  }
}

const getFeeValue = (feesJson: string) => {
  if (!feesJson) return 0
  try {
    const fees = JSON.parse(feesJson)
    return fees.total || 0
  } catch (e) {
    return 0
  }
}

const handleSizeChange = (val: number) => { pagination.size = val; loadCooperations() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadCooperations() }

// 处理合同文件上传
const handleContractChange = (file: any) => {
  // 这里可以添加文件上传到服务器的逻辑
  // 目前暂时使用文件名作为URL
  cooperationForm.contractUrl = file.name
  contractFileList.value = [file]
  ElMessage.success('合同文件已选择')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(cooperationForm, {
    id: undefined,
    projectName: '',
    kolId: null,
    productId: null,
    managerName: '',
    startTime: '',
    endTime: '',
    fee: 0,
    contractUrl: ''
  })
  cooperationTypes.value = []
  contractFileList.value = []
  cooperationFormRef.value?.clearValidate()
  cooperationFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(cooperationForm, {
    ...row,
    startTime: row.startDate, // 后端 startDate 对应前端表单 startTime
    endTime: row.endDate      // 后端 endDate 对应前端表单 endTime
  })
  
  // 处理费用回显
  if (row.feesJson) {
    try {
      const fees = JSON.parse(row.feesJson)
      cooperationForm.fee = fees.total || 0
    } catch (e) {
      cooperationForm.fee = 0
    }
  }

  // 处理形式回显
  if (row.coopFormsJson) {
    try {
      cooperationTypes.value = JSON.parse(row.coopFormsJson)
    } catch (e) {
      cooperationTypes.value = row.coopFormsJson ? row.coopFormsJson.split(',') : []
    }
  } else {
    cooperationTypes.value = []
  }

  cooperationFormRef.value?.clearValidate()
  cooperationFormVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目"${row.projectName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cooperationApi.deleteCooperation(row.id)
    ElMessage.success('删除成功')
    await loadCooperations()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveCooperation = () => {
  cooperationFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const data = {
          ...cooperationForm,
          coopType: cooperationTypes.value // 对齐 backend 接收名
        }

        if (isEdit.value) {
          await cooperationApi.updateCooperation(cooperationForm.id!, data)
          ElMessage.success('更新成功')
        } else {
          await cooperationApi.createCooperation(data)
          ElMessage.success('创建成功')
        }

        cooperationFormVisible.value = false
        await loadCooperations()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

onMounted(() => {
  loadCooperations()
  loadKols()
  loadProducts()
})
</script>

<style scoped lang="scss">
.cooperation-list {
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

      .stat-title { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
      .stat-value { font-size: 28px; font-weight: bold; }
    }
  }

  .table-section {
    .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
  }
}
</style>
