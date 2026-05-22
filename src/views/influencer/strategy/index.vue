<template>
  <div class="influencer-strategy-list">
    <div class="page-header">
      <h3>达人筛选策略列表</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建筛选策略
        </el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="策略名称">
          <el-input v-model="filterForm.strategyName" placeholder="请输入策略名称" />
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
        <el-table-column prop="strategyName" label="策略名称" min-width="180" />
        <el-table-column prop="category" label="关联品类" width="120" />
        <el-table-column prop="description" label="策略描述" min-width="200" show-overflow-tooltip />
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

    <el-dialog v-model="strategyFormVisible" :title="isEdit ? '编辑策略' : '新建筛选策略'" width="600px" :close-on-click-modal="false">
      <el-form :model="strategyForm" :rules="strategyRules" ref="strategyFormRef" label-width="140px">
        <el-form-item label="策略名称" prop="strategyName">
          <el-input v-model="strategyForm.strategyName" placeholder="例如：母婴垂直高转化策略" />
        </el-form-item>
        <el-form-item label="关联品类" prop="category">
          <el-select v-model="strategyForm.category" placeholder="请选择关联品类" style="width: 100%" clearable>
            <el-option label="全品类" value="" />
            <el-option
              v-for="type in productTypes"
              :key="type.id"
              :label="type.typeName"
              :value="type.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略描述" prop="description">
          <el-input v-model="strategyForm.description" type="textarea" :rows="4" placeholder="请输入策略描述" />
        </el-form-item>
        <el-divider content-position="left">筛选条件配置</el-divider>
        <el-form-item label="达人类型">
          <el-checkbox-group v-model="strategyForm.influencerTypes">
            <el-checkbox label="KOL" />
            <el-checkbox label="KOC" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="粉丝数量区间">
          <el-col :span="11">
            <el-input-number v-model="strategyForm.fansMin" :min="0" placeholder="最小值" style="width: 100%" />
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-input-number v-model="strategyForm.fansMax" :min="0" placeholder="最大值" style="width: 100%" />
          </el-col>
        </el-form-item>
        <el-form-item label="核心算法偏好">
          <template #label>
            <span>AI 核心算法偏好
              <el-tooltip content="选择该策略在AI筛选时侧重的算法模型" placement="top">
                <el-icon style="margin-left: 4px"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="strategyForm.filterStrategy" placeholder="请选择算法侧重" style="width: 100%">
            <el-option label="高增长潜力 (发现上升期达人)" value="高增长潜力" />
            <el-option label="高性价比 (侧重转化与ROI)" value="高性价比" />
            <el-option label="头部达人 (侧重品牌曝光)" value="头部达人" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="strategyFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveStrategy" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as businessApi from '@/api/business'
import * as baseDataApi from '@/api/base-data'

const filterForm = reactive({ strategyName: '' })
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

const productTypes = ref<any[]>([])

const strategyFormVisible = ref(false)
const isEdit = ref(false)
const strategyFormRef = ref<FormInstance>()
const strategyForm = reactive({
  id: undefined as number | undefined,
  strategyName: '',
  category: '',
  description: '',
  influencerTypes: [] as string[],
  fansMin: 0,
  fansMax: 5000000,
  filterStrategy: ''
})
const strategyRules: FormRules = {
  strategyName: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择关联品类', trigger: 'change' }],
  description: [{ required: true, message: '请输入策略描述', trigger: 'blur' }]
}
const saving = ref(false)

const loadStrategies = async () => {
  loading.value = true
  try {
    const response = await businessApi.influencerStrategies.getList({
      ...filterForm,
      page: pagination.page - 1,
      size: pagination.size
    })
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    ElMessage.error('加载策略列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => { pagination.page = 1; loadStrategies() }
const handleReset = () => { filterForm.strategyName = ''; pagination.page = 1; loadStrategies() }
const handleSizeChange = (val: number) => { pagination.size = val; loadStrategies() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadStrategies() }

const handleAdd = () => {
  isEdit.value = false
  Object.assign(strategyForm, {
    strategyName: '', category: '', description: '', influencerTypes: [], fansMin: 0, fansMax: 5000000, filterStrategy: ''
  })
  strategyFormRef.value?.clearValidate()
  strategyFormVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(strategyForm, row)
  strategyForm.influencerTypes = row.influencerTypes ? row.influencerTypes.split(',') : []
  strategyFormRef.value?.clearValidate()
  strategyFormVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除策略"${row.strategyName}"吗？`, '提示', { type: 'warning' })
    await businessApi.influencerStrategies.delete(row.id)
    ElMessage.success('删除成功')
    await loadStrategies()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSaveStrategy = () => {
  strategyFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const dataToSend = {
          ...strategyForm,
          influencerTypes: strategyForm.influencerTypes.join(',')
        }

        if (isEdit.value) {
          await businessApi.influencerStrategies.update(strategyForm.id!, dataToSend)
          ElMessage.success('更新成功')
        } else {
          await businessApi.influencerStrategies.create(dataToSend)
          ElMessage.success('创建成功')
        }
        strategyFormVisible.value = false
        await loadStrategies()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const loadProductTypes = async () => {
  try {
    productTypes.value = await baseDataApi.productTypes.getAll()
  } catch (error) {
    console.error('加载产品类型失败:', error)
  }
}

onMounted(() => {
  loadStrategies()
  loadProductTypes()
})
</script>

<style scoped lang="scss">
.influencer-strategy-list {
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
