<template>
  <div class="influencer-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h3>全网达人管理</h3>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建达人
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="达人名称">
          <el-input v-model="filterForm.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="filterForm.platform" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in platformOptions" :key="item.id" :label="item.platformName" :value="item.platformName" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filterForm.kolKocFlag" placeholder="全部" clearable style="width: 120px">
            <el-option label="KOL" value="KOL" />
            <el-option label="KOC" value="KOC" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表区域 -->
    <div class="table-section">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="platform" label="平台" width="100" />
        <el-table-column prop="kolKocFlag" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.kolKocFlag === 'KOL' ? 'success' : 'warning'">{{ row.kolKocFlag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fansCount" label="粉丝数" width="120">
          <template #default="{ row }">
            {{ formatFansCount(row.fansCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="monthlySales" label="月均销售额" width="120">
          <template #default="{ row }">
             ¥{{ row.monthlySales || 0 }}w
          </template>
        </el-table-column>
        <el-table-column prop="conversionRate" label="转化率" width="100">
          <template #default="{ row }">
            {{ row.conversionRate || 0 }}%
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑/新建 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建达人' : '编辑达人'"
      width="750px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24" style="display: flex; justify-content: center; margin-bottom: 20px;">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="handleAvatarUpload"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="达人名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" placeholder="请选择平台" style="width: 100%">
                <el-option v-for="item in platformOptions" :key="item.id" :label="item.platformName" :value="item.platformName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="kolKocFlag">
              <el-radio-group v-model="form.kolKocFlag">
                <el-radio value="KOL">KOL</el-radio>
                <el-radio value="KOC">KOC</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="粉丝数" prop="fansCount">
              <el-input-number v-model="form.fansCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          
          <el-divider content-position="left">经营数据</el-divider>
          
          <el-col :span="12">
            <el-form-item label="主营品类">
              <el-select v-model="form.mainCategories" placeholder="请选择品类" style="width: 100%" clearable>
                <el-option v-for="item in tagOptions" :key="item.id" :label="item.typeName" :value="item.typeName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月销售额(w)">
              <el-input-number v-model="form.monthlySales" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转化率(%)">
              <el-input-number v-model="form.conversionRate" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平均客单价">
              <el-input-number v-model="form.avgOrderValue" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="简介">
              <el-input v-model="form.intro" type="textarea" :rows="3" placeholder="请输入简介" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="带货表现">
              <el-input v-model="form.salesPerformance" type="textarea" :rows="3" placeholder="关键词描述带货表现..." />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as kolApi from '@/api/kols'
import * as baseDataApi from '@/api/base-data'
import { platforms as platformApi } from '@/api/base-data'

const router = useRouter()
const loading = ref(false)
const tableData = ref<any[]>([])
const platformOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

const filterForm = reactive({
  name: '',
  platform: '',
  kolKocFlag: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: null as number | null,
  name: '',
  platform: '',
  kolKocFlag: 'KOL',
  fansCount: 0,
  avgOrderValue: 0,
  intro: '',
  avatar: '',
  mainCategories: '',
  monthlySales: 0,
  conversionRate: 0,
  salesPerformance: '',
  tags: '',
  inResourceLibrary: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }]
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/influencer/selection')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    console.log('开始加载达人列表，参数:', {
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })

    const res = await kolApi.getKols({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })

    console.log('达人列表API返回:', res)

    tableData.value = res.content || []
    pagination.total = res.totalElements || 0

    console.log('表格数据:', tableData.value)
  } catch (e) {
    console.error('加载达人列表失败:', e)
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.platform = ''
  filterForm.kolKocFlag = ''
  handleQuery()
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: null,
    name: '',
    platform: '',
    kolKocFlag: 'KOL',
    fansCount: 0,
    avgOrderValue: 0,
    intro: '',
    avatar: '',
    mainCategories: '',
    monthlySales: 0,
    conversionRate: 0,
    salesPerformance: '',
    tags: '',
    inResourceLibrary: 0
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleSave = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (dialogType.value === 'add') {
          await kolApi.createKol(form)
          ElMessage.success('添加成功')
        } else {
          await kolApi.updateKol(form.id!, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (e) {
        ElMessage.error('操作失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await kolApi.deleteKol(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

const handleAvatarUpload = async (options: any) => {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    const res = await kolApi.uploadAvatar(formData)
    form.avatar = res
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const beforeAvatarUpload = (file: File) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJPGorPNG) ElMessage.error('只能上传 JPG/PNG 格式的图片')
  return isJPGorPNG
}

const formatFansCount = (count: number) => {
  if (!count) return '0'
  return count > 10000 ? (count / 10000).toFixed(1) + 'w' : count
}

const handleSizeChange = (val: number) => {
  pagination.size = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

onMounted(async () => {
  console.log('===== 达人管理页面 mounted 开始 =====')

  try {
    console.log('开始加载基础数据...')

    const [pRes, tRes] = await Promise.all([
      platformApi.getAll().catch(e => {
        console.error('加载平台列表失败:', e)
        return []
      }),
      baseDataApi.productTypes.getAll().catch(e => {
        console.error('加载产品类型失败:', e)
        return []
      })
    ])

    console.log('平台数据:', pRes)
    console.log('产品类型数据:', tRes)

    platformOptions.value = pRes || []
    tagOptions.value = tRes || []

    console.log('基础数据加载完成，开始加载达人列表...')

    await loadData()
  } catch (e) {
    console.error('页面初始化失败:', e)
  }

  console.log('===== 达人管理页面 mounted 结束 =====')
})
</script>

<style scoped lang="scss">
.influencer-manage {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      h3 { margin: 0; font-size: 20px; color: #303133; }
    }
  }

  .filter-section {
    background: #fff;
    padding: 24px 24px 0;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  }

  .table-section {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  }

  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed #dcdfe6;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100px;
      height: 100px;
      &:hover { border-color: #409eff; }
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
    }
    .avatar-preview {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: cover;
    }
  }
}
</style>
