<template>
  <div class="influencer-selection">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="title-icon"><Filter /></el-icon>
        <h3>数据筛选</h3>
      </div>
      <div class="header-actions">
        <el-button type="primary" plain @click="handleGoManage">
          <el-icon><Plus /></el-icon>
          管理全网达人
        </el-button>
      </div>
    </div>

    <div class="selection-container">
      <!-- 智能筛选面板 (参照图1) -->
      <div class="filter-card">
        <h2 class="section-title"></h2>
        
        <div class="base-filter-section">
          <h3 class="filter-title">基础筛选</h3>
          <el-form label-position="top" :model="filterForm">
            <el-row :gutter="40" justify="center">
              <el-col :span="6">
                <el-form-item label="达人类型">
                  <el-select v-model="filterForm.kolKocFlag" placeholder="全部" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="KOL" value="KOL" />
                    <el-option label="KOC" value="KOC" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="产品类别">
                  <el-select v-model="filterForm.category" placeholder="请选择" clearable>
                    <el-option
                      v-for="item in tagOptions"
                      :key="item.id"
                      :label="item.typeName"
                      :value="item.typeName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40" justify="center">
              <el-col :span="6">
                <el-form-item label="品牌">
                  <el-select v-model="filterForm.brand" placeholder="请输入品牌" clearable>
                    <el-option
                      v-for="item in brandOptions"
                      :key="item.id"
                      :label="item.brandName"
                      :value="item.brandName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="产品名称">
                  <el-select v-model="filterForm.productName" placeholder="请选择" clearable>
                    <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.name" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40" justify="center">
              <el-col :span="6">
                <el-form-item label="产品规格/型号">
                  <el-select v-model="filterForm.specification" placeholder="请选择" clearable>
                    <el-option label="型号1" value="型号1" />
                    <el-option label="型号2" value="型号2" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40" justify="center">
              <el-col :span="6">
                <el-form-item label="粉丝数量">
                  <div class="range-input">
                    <el-input-number v-model="filterForm.fansMin" :controls="false" placeholder="最小值" />
                    <span class="separator">-</span>
                    <el-input-number v-model="filterForm.fansMax" :controls="false" placeholder="最大值" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div class="ai-filter-section">
          <div class="section-header">
            <h3 class="filter-title ai">AI智能筛选</h3>
            <el-button type="primary" link @click="handleShowHistory">
              <el-icon style="margin-right: 4px"><Clock /></el-icon>
              查看筛选历史
            </el-button>
          </div>
          <el-form label-position="top" :model="aiFilterForm">
            <el-row :gutter="40" justify="center">
              <el-col :span="12">
                <el-form-item label="选择筛选策略">
                  <el-select 
                    v-model="aiFilterForm.strategy" 
                    placeholder="请选择预设策略" 
                    clearable 
                    style="width: 100%"
                    @change="handleStrategyChange"
                  >
                    <el-option label="自定义配置" value="" />
                    <el-option
                      v-for="item in strategyOptions"
                      :key="item.id"
                      :label="item.strategyName"
                      :value="item.strategyName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="40" justify="center" v-if="aiFilterForm.strategy">
              <el-col :span="24">
                <el-alert
                  title="已根据策略自动填充筛选条件"
                  type="info"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 20px"
                >
                  已应用策略：{{ aiFilterForm.strategy }}。您可以直接点击“AI筛选”开始分析。
                </el-alert>
              </el-col>
            </el-row>

            <el-row :gutter="40" justify="center">
              <el-col :span="6">
                <el-form-item label="关联品类">
                  <el-select 
                    v-model="aiFilterForm.relatedCategory" 
                    :disabled="!!aiFilterForm.strategy" 
                    placeholder="无" 
                    clearable
                  >
                    <el-option label="无" value="" />
                    <el-option
                      v-for="item in tagOptions"
                      :key="item.id"
                      :label="item.typeName"
                      :value="item.typeName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="模型选择">
                  <el-select v-model="aiFilterForm.aiModel">
                    <el-option label="豆包" value="豆包" />
                    <el-option label="DeepSeek" value="DeepSeek" />
                    <el-option label="GPT-4" value="GPT-4" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20" justify="center" align="middle" style="margin-top: 10px;">
              <el-col :span="6" style="display: flex; gap: 10px;">
                <el-button type="primary" class="ai-btn" @click="handleAIScreening" :loading="screening">
                  开始 AI 筛选分析
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>

      <!-- 筛选结果展示 (参照图2) -->
      <div class="result-card" v-if="showResult">
        <h2 class="section-title">KOL, KOC列表</h2>
        
        <!-- 数据看板 -->
        <el-row :gutter="20" class="stat-board">
          <el-col :span="8">
            <div class="stat-item orange">
              <div class="stat-icon"><el-icon><User /></el-icon></div>
              <div class="stat-content">
                <div class="label">达人数量</div>
                <div class="value">{{ pagination.total }}</div>
                <div class="trend"><el-icon><Top /></el-icon> 6.66% 较上个月</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item blue">
              <div class="stat-icon"><el-icon><Select /></el-icon></div>
              <div class="stat-content">
                <div class="label">已筛选达人数量</div>
                <div class="value">{{ tableData.length }}</div>
                <div class="trend"><el-icon><Top /></el-icon> 6.66% 较上个月</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item green">
              <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="stat-content">
                <div class="label">AI筛选准确率</div>
                <div class="value">90.2%</div>
                <div class="trend"><el-icon><Top /></el-icon> 6.66% 较上个月</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 结果表格 -->
        <div class="table-container">
          <div class="table-filter-bar">
            <el-form :inline="true" size="default">
              <el-form-item label="达人名称">
                <el-select v-model="filterForm.name" placeholder="达人一号" clearable @change="loadKols">
                  <el-option v-for="item in tableData" :key="item.id" :label="item.name" :value="item.name" />
                </el-select>
              </el-form-item>
              <el-form-item label="达人平台">
                <el-select v-model="filterForm.platform" placeholder="抖音" clearable @change="loadKols">
                  <el-option label="抖音" value="抖音" />
                  <el-option label="小红书" value="小红书" />
                </el-select>
              </el-form-item>
              <el-form-item label="粉丝数量">
                <div class="range-input mini">
                  <el-input-number v-model="filterForm.fansMin" :controls="false" placeholder="最小值" />
                  <span>-</span>
                  <el-input-number v-model="filterForm.fansMax" :controls="false" placeholder="最大值" />
                </div>
              </el-form-item>
              <el-form-item label="时间排序">
                <el-select v-model="filterForm.sort" placeholder="时间排序" clearable>
                  <el-option label="最新" value="desc" />
                  <el-option label="最早" value="asc" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="tableData" v-loading="loading">
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="name" label="达人名称" />
            <el-table-column prop="platform" label="平台" />
            <el-table-column prop="fansCount" label="粉丝数">
              <template #default="{ row }">
                {{ formatFansCount(row.fansCount) }}
              </template>
            </el-table-column>
            <el-table-column prop="kolKocFlag" label="KOL/KOC" />
            <el-table-column prop="monthlySales" label="销售额（近一个月）">
              <template #default="{ row }">
                ¥{{ row.monthlySales || 0 }}w
              </template>
            </el-table-column>
            <el-table-column label="AI分析报告">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewReport(row)">查看报告</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <div class="op-btns">
                  <el-button size="small" type="success" plain @click="handleAddToResource(row)">加入资源库</el-button>
                  <el-button size="small" type="primary" plain @click="handleViewReport(row)">查看报告</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              layout="prev, pager, next"
              @current-change="handleCurrentChange"
            />
          </div>

          <div class="bottom-actions">
            <el-button type="success" @click="handleBatchAddToResource">批量添加到资源库</el-button>
            <el-button type="primary" @click="handleExport">导出预备达人列表</el-button>
            <el-button type="primary" @click="handleRescreening">AI筛选新KOL,KOC</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI分析报告弹窗 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="AI分析报告"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="ai-report" v-if="currentInfluencer">
        <div class="report-header">
          <h4>{{ currentInfluencer.name }} - AI分析报告</h4>
          <p class="report-meta">
            分析时间：{{ currentInfluencer.updateTime }} | AI模型：{{ aiFilterForm.aiModel }}
          </p>
        </div>

        <div class="report-content">
          <div class="report-section">
            <h5>推荐理由</h5>
            <p>{{ generateRecommendation(currentInfluencer) }}</p>
          </div>

          <div class="report-section">
            <h5>数据分析</h5>
            <ul>
              <li>粉丝总数：{{ formatFansCount(currentInfluencer.fansCount) }}</li>
              <li>主要平台：{{ currentInfluencer.platform }}</li>
              <li>达人类型：{{ currentInfluencer.type }}</li>
              <li>月均销售额：¥{{ currentInfluencer.monthlySales || 0 }}万</li>
              <li>AI评分：{{ currentInfluencer.aiScore }}/5</li>
            </ul>
          </div>

          <div class="report-section">
            <h5>合作建议</h5>
            <ul>
              <li>建议合作方式：短视频推广+直播带货</li>
              <li>预估合作费用：¥{{ currentInfluencer.estimatedCost || 10 }}万</li>
              <li>预计曝光量：{{ currentInfluencer.estimatedExposure || '500万+' }}</li>
              <li>建议合作周期：3个月</li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="reportDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleAddToResource">添加到资源库</el-button>
      </template>
    </el-dialog>


  </div>

    <!-- AI筛选历史记录弹窗 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="AI筛选记录历史"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-table :data="historyList" v-loading="historyLoading" height="400px">
        <el-table-column prop="createTime" label="筛选时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="aiStrategy" label="策略名称" width="150" />
        <el-table-column prop="aiModel" label="AI模型" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewHistoryDetail(row)" :disabled="!row.reportContent">
              查看报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" style="justify-content: flex-end; margin-top: 10px;">
        <el-pagination
          v-model:current-page="historyPagination.page"
          :total="historyPagination.total"
          layout="prev, pager, next"
          @current-change="handleHistoryPageChange"
        />
      </div>
    </el-dialog>

    <!-- 筛选报告详情弹窗 (支持Markdown) -->
    <el-dialog
      v-model="reportDetailVisible"
      title="AI 达人筛选分析报告"
      width="900px"
      append-to-body
      custom-class="report-detail-dialog"
    >
      <div class="report-detail-container" v-if="currentReport">
        <div class="report-meta">
          <el-tag size="small">{{ currentReport.aiStrategy }}</el-tag>
          <el-tag size="small" type="success" style="margin-left: 8px">{{ currentReport.aiModel }}</el-tag>
          <span class="time">{{ formatDateTime(currentReport.createTime) }}</span>
        </div>
        <el-divider />
        <div class="markdown-body" v-html="renderMarkdown(currentReport.reportContent)"></div>
      </div>
      <template #footer>
        <el-button @click="reportDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="printReport">打印报告</el-button>
      </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Filter, Top, Clock, User, Select, CircleCheckFilled } from '@element-plus/icons-vue'
import { marked } from 'marked'
import type { FormInstance, FormRules } from 'element-plus'
import * as kolApi from '@/api/kols'
import * as businessApi from '@/api/business'
import * as baseDataApi from '@/api/base-data'
import * as productApi from '@/api/products'
import { platforms as platformApi } from '@/api/base-data'

// 路由
const router = useRouter()

// 结果展示开关
const showResult = ref(false)

// 基础筛选表单
const filterForm = reactive({
  kolKocFlag: '',
  category: '',
  brand: '',
  productName: '',
  specification: '',
  fansMin: 1000,
  fansMax: 5000000,
  name: '',
  platform: '',
  sort: 'desc'
})

// 监听策略变化，自动填充关联参数
const handleStrategyChange = (strategyName: string) => {
  if (!strategyName) {
    return
  }
  
  const selected = strategyOptions.value.find(s => s.strategyName === strategyName)
  if (selected) {
    // 自动填充基础筛选条件
    filterForm.fansMin = selected.fansMin || 0
    filterForm.fansMax = selected.fansMax || 5000000
    
    // 处理达人类型 (KOL,KOC 逗号分隔)
    if (selected.influencerTypes) {
      if (selected.influencerTypes.includes('KOL') && !selected.influencerTypes.includes('KOC')) {
        filterForm.kolKocFlag = 'KOL'
      } else if (selected.influencerTypes.includes('KOC') && !selected.influencerTypes.includes('KOL')) {
        filterForm.kolKocFlag = 'KOC'
      } else {
        filterForm.kolKocFlag = ''
      }
    }

    // 自动填充 AI 筛选表单
    aiFilterForm.relatedCategory = selected.category || ''
    // 注意：filterStrategy 后端处理逻辑中已包含高性价比侧重，无需再主页单独勾选
    aiFilterForm.highCostEffective = selected.filterStrategy === '高性价比'
    
    ElMessage.info({
      message: `已自动加载策略 [${strategyName}] 的配置项`,
      duration: 2000
    })
  }
}

// AI筛选表单
const aiFilterForm = reactive({
  strategy: '',
  relatedCategory: '',
  highCostEffective: false,
  aiModel: 'DeepSeek',
  enableSearch: true
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const screening = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const strategyOptions = ref<any[]>([])
const platformOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])
const brandOptions = ref<any[]>([])
const productList = ref<any[]>([])

// 达人AI报告弹窗
const reportDialogVisible = ref(false)
const currentInfluencer = ref<any>(null)

// AI报告详情
const reportDetailVisible = ref(false)
const currentReport = ref<any>(null)

// 筛选历史记录
const historyDialogVisible = ref(false)
const historyLoading = ref(false)
const historyList = ref<any[]>([])
const historyPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const renderMarkdown = (content: string) => {
  if (!content) return '暂无报告内容'
  return marked(content)
}

const formatDateTime = (time: string | any) => {
  if (!time) return '-'
  if (Array.isArray(time)) {
    // 处理后端 LocalDateTime 数组格式 [2026, 4, 13, 22, 45, 31]
    const [y, m, d, h, min, s] = time
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return new Date(time).toLocaleString()
}

const handleShowHistory = async () => {
  historyDialogVisible.value = true
  loadHistory()
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const res = await kolApi.getFilterHistory({
      page: historyPagination.page - 1,
      size: historyPagination.size
    })
    historyList.value = res.content || []
    historyPagination.total = res.totalElements || 0
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

const handleHistoryPageChange = (val: number) => {
  historyPagination.page = val
  loadHistory()
}

const handleViewHistoryDetail = (row: any) => {
  currentReport.value = row
  reportDetailVisible.value = true
}

const printReport = () => {
  window.print()
}

const pollFilterResult = async (taskId: string, filterId: string) => {
  const interval = setInterval(async () => {
    try {
      const result = await kolApi.getFilterResult(taskId)
      console.log('筛选任务状态:', result.task?.status)
      console.log('筛选任务结果:', result)

      if (result.task && (result.task.status === 'success' || result.task.status === 'completed')) {
        clearInterval(interval)
        screening.value = false

        console.log('AI筛选成功，开始加载达人列表...')

        // 重新加载达人列表（此时数据库中已经保存了筛选结果）
        await loadKols()

        console.log('达人列表已加载，数量:', tableData.value.length)

        // 保存到 localStorage 作为"上一次筛选结果"
        const lastFilterResult = {
          filterParams: {
            ...filterForm,
            aiStrategy: aiFilterForm.strategy,
            productCategory: aiFilterForm.relatedCategory,
            aiModel: aiFilterForm.aiModel
          },
          tableData: tableData.value,
          pagination: { ...pagination },
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('lastFilterResult', JSON.stringify(lastFilterResult))
        console.log('筛选结果已保存到 localStorage')

        // 显示结果区域
        showResult.value = true

        console.log('showResult 已设置为:', showResult.value)

        // 滚动到结果区域
        setTimeout(() => {
          const resultElement = document.querySelector('.result-card')
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            console.log('已滚动到结果区域')
          }
        }, 300)

        ElMessage.success(`AI筛选完成，为您推荐${tableData.value.length}位达人`)

        // 延迟显示分析报告，让用户先看到结果列表
        setTimeout(async () => {
          if (filterId) {
            try {
              const historyRes = await kolApi.getFilterHistory({ page: 0, size: 100 })
              const latest = (historyRes.content || []).find((h: any) => String(h.id) === String(filterId))
              if (latest && latest.reportContent) {
                console.log('找到筛选历史记录，显示报告')
                handleViewHistoryDetail(latest)
              }
            } catch (e) {
              console.error('获取筛选历史失败:', e)
            }
          }
        }, 1500) // 延迟1.5秒显示报告
      } else if (result.task && result.task.status === 'failed') {
        clearInterval(interval)
        screening.value = false
        ElMessage.error('AI筛选失败：' + (result.task.error || '未知错误'))
      }
    } catch (error) {
      console.error('轮询查询结果失败:', error)
      clearInterval(interval)
      screening.value = false
    }
  }, 3000)
}

const handleAIScreening = async () => {
  if (!aiFilterForm.strategy) {
    ElMessage.warning('请先选择筛选策略')
    return
  }

  screening.value = true
  try {
    const params = {
      ...filterForm,
      aiStrategy: aiFilterForm.strategy,
      productCategory: aiFilterForm.relatedCategory,
      highCostEffective: aiFilterForm.highCostEffective,
      aiModel: aiFilterForm.aiModel,
      enableSearch: aiFilterForm.enableSearch
    }

    const response = await kolApi.filterKols(params)

    if (response.taskId) {
      ElMessage.success('AI筛选任务已创建，正在分析中...')
      pollFilterResult(response.taskId, response.filterId)
    } else {
      const content = response.content || response.list || []
      tableData.value = content.map((item: any) => ({
        ...item,
        name: item.name || item.kolName || '',
        kolKocFlag: item.kolKocFlag || (item.fansCount > 100000 ? 'KOL' : 'KOC'),
        monthlySales: item.monthlySales || 0,
        updateTime: item.updateTime || new Date().toLocaleString()
      }))
      pagination.total = response.totalElements || response.total || 0
      showResult.value = true
      ElMessage.success(`AI筛选完成，为您推荐${tableData.value.length}位达人`)
    }
  } catch (error) {
    console.error('AI筛选失败:', error)
    ElMessage.error('AI筛选失败')
  } finally {
    screening.value = false
  }
}


const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadKols()
}

const handleReset = () => {
  // 重置基础筛选表单
  Object.assign(filterForm, {
    kolKocFlag: '',
    category: '',
    brand: '',
    productName: '',
    specification: '',
    fansMin: 1000,
    fansMax: 5000000,
    name: '',
    platform: '',
    sort: 'desc'
  })

  // 重置AI筛选表单
  Object.assign(aiFilterForm, {
    strategy: '',
    relatedCategory: '',
    highCostEffective: false,
    aiModel: 'DeepSeek',
    enableSearch: true
  })

  // 清除上一次的筛选结果
  localStorage.removeItem('lastFilterResult')
  showResult.value = false
  ElMessage.success('筛选条件已重置，上次的筛选结果已清除')
}

const loadKols = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page - 1,
      size: pagination.size
    }

    // 添加筛选条件
    if (filterForm.name) params.keyword = filterForm.name
    if (filterForm.platform) params.platform = filterForm.platform
    if (filterForm.kolKocFlag) params.kolKocFlag = filterForm.kolKocFlag
    if (filterForm.fansMin || filterForm.fansMax) {
      // 粉丝数范围筛选（需要在后端支持）
      if (filterForm.fansMin) params.fansMin = filterForm.fansMin
      if (filterForm.fansMax) params.fansMax = filterForm.fansMax
    }

    const response = await kolApi.getKols(params)
    const content = response.content || response.list || []
    tableData.value = content.map((item: any) => ({
      ...item,
      name: item.name || item.kolName || '',
      kolKocFlag: item.kolKocFlag || (item.fansCount > 100000 ? 'KOL' : 'KOC'),
      monthlySales: item.monthlySales || 0,
      updateTime: item.updateTime || new Date().toLocaleString()
    }))
    pagination.total = response.totalElements || response.total || 0
  } catch (error) {
    console.error('加载达人列表失败:', error)
    ElMessage.error('加载达人列表失败')
  } finally {
    loading.value = false
  }
}

const handleViewReport = (row: any) => {
  currentInfluencer.value = row
  reportDialogVisible.value = true
}





const handleGoManage = () => {
  router.push('/influencer/manage')
}

const handleExport = () => {
  ElMessage.success('达人列表导出中，请稍候...')
}

const handleRescreening = () => {
  showResult.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}



const handleAddToResource = async (row: any) => {
  try {
    // 将达人添加到资源库
    await kolApi.addToResourceLibrary(row.id)
    ElMessage.success(`已将 ${row.name} 添加至预备合作达人资源库`)
    // 刷新列表以更新状态
    await loadKols()
  } catch (error) {
    console.error('添加到资源库失败:', error)
    ElMessage.error('添加到资源库失败')
  }
}

// 批量添加到资源库
const handleBatchAddToResource = async () => {
  try {
    // 这里可以添加批量选择功能，暂时简化为提示用户单个添加
    ElMessage.info('请点击每位达人的"加入资源库"按钮进行添加')
  } catch (error) {
    console.error('批量添加失败:', error)
    ElMessage.error('批量添加失败')
  }
}

const generateRecommendation = (influencer: any) => {
  return `该达人在保健品领域具有较强的影响力，粉丝质量高，互动率达到15.8%，远高于同类达人平均水平。近30天带货表现优异，转化率达到32.5%，ROI达到1:8.2。AI综合评分为${influencer.aiScore}/5，建议优先合作。`
}

const formatFansCount = (count: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}



const loadOptions = async () => {
  try {
    // 获取策略列表
    const sRes = await businessApi.influencerStrategies.getList({ page: 0, size: 100 })
    strategyOptions.value = sRes.content || []
    
    // 获取平台列表
    const pRes = await platformApi.getAll()
    platformOptions.value = pRes || []

    // 获取品类列表
    const tRes = await baseDataApi.productTypes.getAll()
    tagOptions.value = tRes || []

    // 获取品牌列表
    const bRes = await baseDataApi.brands.getAll()
    brandOptions.value = bRes || []

    // 获取产品列表
    const prRes = await productApi.getProducts({ page: 0, size: 100 }) as any
    productList.value = prRes.page?.content || prRes.list || prRes.content || []
  } catch (e) {
    console.error('加载选项失败:', e)
  }
}

onMounted(() => {
  loadOptions()

  // 检查是否有上一次的筛选结果
  const lastResult = localStorage.getItem('lastFilterResult')
  if (lastResult) {
    try {
      const parsed = JSON.parse(lastResult)
      console.log('发现上一次的筛选结果:', parsed)

      // 检查结果是否过期（超过7天）
      const resultTime = new Date(parsed.timestamp)
      const now = new Date()
      const daysDiff = (now.getTime() - resultTime.getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff > 7) {
        console.log('上次的筛选结果已过期（超过7天），已清除')
        localStorage.removeItem('lastFilterResult')
      } else {
        // 恢复筛选参数
        Object.assign(filterForm, parsed.filterParams)
        Object.assign(aiFilterForm, {
          strategy: parsed.filterParams.aiStrategy,
          relatedCategory: parsed.filterParams.productCategory,
          aiModel: parsed.filterParams.aiModel
        })

        // 恢复表格数据
        tableData.value = parsed.tableData
        Object.assign(pagination, parsed.pagination)

        // 显示结果区域
        showResult.value = true

        ElMessage.info(`已为您加载上次的筛选结果（${Math.floor(daysDiff)}天前），共${tableData.value.length}位达人`)

        // 延迟滚动到结果区域
        setTimeout(() => {
          const resultElement = document.querySelector('.result-card')
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)
      }
    } catch (e) {
      console.error('解析上次的筛选结果失败:', e)
      localStorage.removeItem('lastFilterResult')
    }
  }

  loadKols()
})
</script>

<style scoped lang="scss">
.influencer-selection {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h3 {
      margin: 0;
      color: #303133;
      font-size: 18px;
    }
  }

  .filter-section {
    margin-bottom: 20px;

    .filter-group {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 15px;

      &:last-child { margin-bottom: 0; }

      h4 {
        margin: 0 0 15px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }

      .filter-form {
        margin: 0;

        :deep(.el-form-item) { margin-bottom: 12px; }
      }
    }
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }

  .result-section {
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
        }
      }
    }

    .table-section {
      .table-header {
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .ai-report {
    .report-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      h4 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 16px;
      }

      .report-meta {
        margin: 0;
        color: #909399;
        font-size: 13px;
      }
    }

    .report-content {
      .report-section {
        margin-bottom: 20px;

        h5 {
          margin: 0 0 12px 0;
          color: #303133;
          font-size: 14px;
          font-weight: 600;
        }

        p {
          margin: 0 0 10px 0;
          color: #606266;
          line-height: 1.6;
        }

        ul {
          margin: 0;
          padding-left: 20px;

          li {
            margin-bottom: 8px;
            color: #606266;
            line-height: 1.6;
          }
        }
      }
    }
  }
}
</style>
