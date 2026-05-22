<template>
  <div class="influencer-resource">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>预备合作达人资源库</h3>
      <div class="header-actions">
        <el-button @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 筛选和分类 -->
    <div class="filter-section">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane
          v-for="tag in tagOptions"
          :key="tag.id"
          :label="tag.typeName"
          :name="tag.typeName"
        />
      </el-tabs>

      <div class="status-tabs">
        <el-radio-group v-model="filterForm.coopStatus" @change="loadKols">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button :value="0">未开始</el-radio-button>
          <el-radio-button :value="1">进行中</el-radio-button>
          <el-radio-button :value="2">已完成</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 达人卡片列表 -->
    <div class="cards-container" v-loading="loading">
      <el-row :gutter="20">
        <el-col
          v-for="kol in tableData"
          :key="kol.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="kol-card">
            <div class="card-header">
              <el-avatar :size="60" :src="kol.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="kol-info">
                <h4>{{ kol.name }}</h4>
                <div class="kol-tags">
                  <el-tag size="small" :type="kol.kolKocFlag === 'KOL' ? 'success' : 'warning'">
                    {{ kol.kolKocFlag }}
                  </el-tag>
                  <el-tag size="small" type="info">{{ kol.platform }}</el-tag>
                </div>
              </div>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <div class="stat-label">粉丝数</div>
                <div class="stat-value">{{ formatFansCount(kol.fansCount) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">客单价</div>
                <div class="stat-value">¥{{ kol.avgOrderValue || 0 }}</div>
              </div>
            </div>

            <div class="card-metrics">
              <div class="metric-item">
                <span class="label">销量:</span>
                <span class="value">{{ kol.salesVolume || 0 }}</span>
              </div>
              <div class="metric-item">
                <span class="label">销售额:</span>
                <span class="value">¥{{ formatAmount(kol.salesAmount) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <el-button link type="primary" @click="handleViewDetail(kol)">
                查看详情
              </el-button>
              <el-button link type="primary" @click="handleCreateCoop(kol)">
                新建合作
              </el-button>
              <el-dropdown trigger="click" @command="(cmd: string | number | object) => handleCommand(cmd as string, kol)">
                <el-button link type="info">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-if="tableData.length === 0" description="暂无达人数据" />

      <!-- 分页 -->
      <div class="pagination" v-if="tableData.length > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 达人详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="达人详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="premium-kol-detail" v-if="currentKol">
        <!-- 头部基础信息 (参照图3) -->
        <div class="header-section">
          <el-avatar :size="100" :src="currentKol.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="kol-avatar" />
          <div class="basic-info">
            <h2 class="kol-name">{{ currentKol.name }}</h2>
            <div class="kol-labels">
              <span class="type-tag">{{ currentKol.kolKocFlag }}</span>
              <span class="category-tag">{{ currentKol.mainCategories || currentKol.tags || '综合' }}</span>
            </div>
          </div>
        </div>

        <!-- 关键指标卡片 (参照图3) -->
        <el-row :gutter="15" class="stat-cards">
          <el-col :span="8">
            <div class="stat-card">
              <div class="label">总粉丝数</div>
              <div class="value-row">
                <span class="value">{{ formatFansCount(currentKol.fansCount) }}</span>
              </div>
              <div class="trend up">
                <el-icon><Top /></el-icon> 10.2% <span class="period">30天</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="label">达人状态</div>
              <div class="status-value highlight">{{ getCoopStatusText(currentKol.coopStatus) }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="label">平台</div>
              <div class="platform-value">
                <img :src="getPlatformIcon(currentKol.platform)" class="platform-icon" v-if="getPlatformIcon(currentKol.platform)" />
                {{ currentKol.platform }}
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 达人简介 (参照图3) -->
        <div class="detail-section">
          <h3 class="section-title">达人简介</h3>
          <div class="intro-box">
            <p>{{ currentKol.intro || '暂无详细介绍' }}</p>
            
            <el-row class="meta-grid">
              <el-col :span="8">
                <div class="meta-item">
                  <div class="m-label">主要平台</div>
                  <div class="m-value">{{ currentKol.platform || '多平台' }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="meta-item">
                  <div class="m-label">合作时间</div>
                  <div class="m-value">2025.9.12</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="meta-item">
                  <div class="m-label">近一个月销售额</div>
                  <div class="m-value">{{ currentKol.monthlySales || 0 }}w</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 带货表现 (参照图3) -->
        <div class="detail-section">
          <h3 class="section-title">带货表现</h3>
          <el-row :gutter="15">
            <el-col :span="12">
              <div class="stat-card mini">
                <div class="label">近30天带货总量</div>
                <div class="value">{{ formatAmount(currentKol.salesVolume) }}</div>
                <div class="trend up">
                  <el-icon><Top /></el-icon> 10.2% <span class="period">30天</span>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-card mini">
                <div class="label">平均客单价</div>
                <div class="value">{{ currentKol.avgOrderValue || 0 }}元</div>
                <div class="trend up">
                  <el-icon><Top /></el-icon> 10.2% <span class="period">30天</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleCreateCoop(currentKol)">新建合作</el-button>
      </template>
    </el-dialog>

    <!-- 新建合作弹窗 -->
    <el-dialog
      v-model="coopFormVisible"
      title="新建合作"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="coopForm" :rules="coopRules" ref="coopFormRef" label-width="120px">
        <el-form-item label="合作项目名称" prop="projectName">
          <el-input v-model="coopForm.projectName" placeholder="请输入合作项目名称" />
        </el-form-item>
        <el-form-item label="合作达人">
          <el-input v-model="currentKol.name" disabled />
        </el-form-item>
        <el-form-item label="负责人" prop="managerName">
          <el-input v-model="coopForm.managerName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="关联产品" prop="productId">
          <el-select v-model="coopForm.productId" placeholder="请选择关联产品" style="width: 100%" clearable>
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合作形式" prop="coopType">
          <el-checkbox-group v-model="coopForm.coopType">
            <el-checkbox label="抖音短视频推广" value="抖音短视频推广" />
            <el-checkbox label="直播带货" value="直播带货" />
            <el-checkbox label="小红书种草笔记" value="小红书种草笔记" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="合作时间">
          <el-col :span="11">
            <el-date-picker
              v-model="coopForm.startTime"
              type="date"
              placeholder="开始时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="coopForm.endTime"
              type="date"
              placeholder="结束时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="预计费用" prop="fee">
          <el-input-number v-model="coopForm.fee" :min="0" placeholder="请输入费用" style="width: 100%" />
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
        <el-button @click="coopFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCoop">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Top } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as kolApi from '@/api/kols'
import * as cooperationApi from '@/api/cooperation'
import * as productApi from '@/api/products'
import * as baseDataApi from '@/api/base-data'
import { platforms as platformApi } from '@/api/base-data'

// 筛选表单
const filterForm = reactive({
  platform: '',
  kolKocFlag: '',
  coopStatus: null as number | null,
  keyword: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)

// 当前选中的Tab
const activeTab = ref('all')

// 分页
const pagination = reactive({
  page: 1,
  size: 12,
  total: 0
})

const platformOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

// 达人详情
const detailDialogVisible = ref(false)
const currentKol = ref<any>({})

// 产品列表（用于筛选）
const productList = ref<any[]>([])
const contractFileList = ref<any[]>([])

// 合作表单
const coopFormVisible = ref(false)
const coopFormRef = ref<FormInstance>()
const coopForm = reactive({
  projectName: '',
  managerName: '',
  productId: null as number | null,
  coopType: [] as string[],
  startTime: '',
  endTime: '',
  fee: 0,
  contractUrl: ''
})

const coopRules: FormRules = {
  projectName: [{ required: true, message: '请输入合作项目名称', trigger: 'blur' }],
  coopType: [{ required: true, message: '请选择合作形式', trigger: 'change' }]
}

const getCoopStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '未开始',
    1: '进行中',
    2: '已完成'
  }
  return map[status] || '进行中'
}

const getPlatformIcon = (_platform: string) => {
  // 这里可以根据平台名称返回对应图标URL或样式类
  return ''
}



// 格式化粉丝数
const formatFansCount = (count: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}

// 格式化金额
const formatAmount = (amount: number) => {
  if (!amount) return '0'
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + 'w'
  }
  return amount.toString()
}

// 加载达人列表
const loadKols = async () => {
  loading.value = true
  try {
    const params: any = {
      ...filterForm,
      inResourceLibrary: 1,
      page: pagination.page - 1,
      size: pagination.size
    }

    // 根据Tab添加筛选条件
    if (activeTab.value !== 'all') {
      params.keyword = activeTab.value
    }

    const response = await kolApi.getKols(params)

    // 后端返回的是Page对象
    tableData.value = response.content || []
    pagination.total = response.totalElements || 0
  } catch (error) {
    console.error('加载达人列表失败:', error)
    ElMessage.error('加载达人列表失败')
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = () => {
  pagination.page = 1
  loadKols()
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  loadKols()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadKols()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentKol.value = row
  detailDialogVisible.value = true
}

// 新建合作
const handleCreateCoop = async (row: any) => {
  currentKol.value = row
  // 加载产品列表用于关联
  if (productList.value.length === 0) {
    try {
      const res = await productApi.getProducts({ page: 0, size: 100 })
      // 后端返回结构是 { stats: {...}, page: { content: [...] } }
      const pageData = res.page || res
      productList.value = pageData.content || pageData.list || []
    } catch (e) {
      console.error('加载产品列表失败', e)
    }
  }

  Object.assign(coopForm, {
    projectName: '',
    managerName: '',
    productId: null,
    coopType: [],
    startTime: '',
    endTime: '',
    fee: 0,
    contractUrl: ''
  })
  contractFileList.value = []
  detailDialogVisible.value = false
  coopFormVisible.value = true
}

// 处理合同文件上传
const handleContractChange = (file: any) => {
  coopForm.contractUrl = file.name
  contractFileList.value = [file]
  ElMessage.success('合同文件已选择')
}

// 保存合作
const savingCoop = ref(false)
const handleSaveCoop = () => {
  coopFormRef.value?.validate(async (valid) => {
    if (valid) {
      savingCoop.value = true
      try {
        const data = {
          ...coopForm,
          kolId: currentKol.value.id
        }
        await cooperationApi.createCooperation(data)
        ElMessage.success('合作项目创建成功')
        coopFormVisible.value = false
      } catch (error) {
        console.error('创建合作失败:', error)
        ElMessage.error('创建合作失败')
      } finally {
        savingCoop.value = false
      }
    }
  })
}

// 命令处理
const handleCommand = (command: string, row: any) => {
  if (command === 'edit') {
    ElMessage.info('编辑功能开发中')
  } else if (command === 'delete') {
    ElMessageBox.confirm(
      `确定要删除达人"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await kolApi.deleteKol(row.id)
        ElMessage.success('删除成功')
        loadKols()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    }).catch(() => {
      // 用户取消
    })
  }
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}

const loadOptions = async () => {
  try {
    const pRes = await platformApi.getAll()
    platformOptions.value = pRes || []

    const tRes = await baseDataApi.productTypes.getAll()
    tagOptions.value = tRes || []
  } catch (error) {}
}

// 页面加载时获取数据
onMounted(() => {
  loadOptions()
  loadKols()
})
</script>

<style scoped lang="scss">
.influencer-resource {
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

    .status-tabs {
      margin-top: 15px;
    }
  }

  .cards-container {
    .kol-card {
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .kol-info {
          margin-left: 15px;
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 16px;
          }

          .kol-tags {
            display: flex;
            gap: 8px;
          }
        }
      }

      .card-stats {
        display: flex;
        justify-content: space-around;
        padding: 15px 0;
        border-top: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;

        .stat-item {
          text-align: center;

          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #409eff;
          }
        }
      }

      .card-metrics {
        padding: 15px 0;

        .metric-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
          }

          .value {
            color: #303133;
            font-weight: 500;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .premium-kol-detail {
    padding: 0 10px;

    .header-section {
      display: flex;
      align-items: center;
      gap: 25px;
      margin-bottom: 30px;

      .kol-avatar {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .kol-name {
        font-size: 24px;
        margin: 0 0 10px 0;
        color: #262626;
      }

      .kol-labels {
        display: flex;
        gap: 15px;
        font-size: 14px;
        color: #595959;

        .type-tag {
          font-weight: 600;
        }
      }
    }

    .stat-cards {
      margin-bottom: 30px;

      .stat-card {
        background: #f5f5f5;
        border-radius: 12px;
        padding: 16px;
        text-align: left;
        height: 100%;

        .label {
          font-size: 12px;
          color: #8c8c8c;
          margin-bottom: 8px;
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: #262626;
        }

        .status-value {
          font-size: 18px;
          color: #1890ff;
          margin-top: 5px;
        }

        .platform-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
        }

        .trend {
          margin-top: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up { color: #52c41a; }
          &.down { color: #ff4d4f; }
          .period { color: #8c8c8c; margin-left: 4px; }
        }

        &.mini {
          padding: 12px 16px;
          .value { font-size: 18px; }
        }
      }
    }

    .detail-section {
      margin-bottom: 30px;

      .section-title {
        font-size: 18px;
        margin: 0 0 15px 0;
        color: #262626;
        font-weight: 500;
      }

      .intro-box {
        background: #f5f5f5;
        border-radius: 20px;
        padding: 25px;

        p {
          font-size: 15px;
          line-height: 1.8;
          color: #262626;
          margin: 0 0 25px 0;
        }

        .meta-grid {
          .meta-item {
            .m-label {
              font-size: 13px;
              color: #8c8c8c;
              margin-bottom: 6px;
            }
            .m-value {
              font-size: 15px;
              color: #262626;
            }
          }
        }
      }
    }
  }
}
</style>
