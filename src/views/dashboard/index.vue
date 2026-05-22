<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>总产品数</template>
          <div class="stat-value">{{ stats.totalProducts || '0' }}</div>
          <div class="stat-footer">环比上升 {{ stats.productGrowth || '0%' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>已上架产品</template>
          <div class="stat-value">{{ stats.listedProducts || '0' }}</div>
          <div class="stat-footer">上架率 {{ stats.listingRate || '0.0%' }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>活跃分销商</template>
          <div class="stat-value">{{ stats.activeDistributors || '0' }}</div>
          <div class="stat-footer">本月新增 {{ stats.newDistributorsMonth || '0' }} 家</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>AI 分析次数</template>
          <div class="stat-value">{{ stats.aiAnalysisCounts || '0' }}</div>
          <div class="stat-footer">今日增长 {{ stats.aiGrowthToday || '0' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>营销增长趋势 (AI 预测 vs 实际)</template>
          <div ref="chartRef" class="chart-box" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>最新 AI 分析报告</template>
          <el-timeline>
            <el-timeline-item timestamp="2026/04/09" placement="top">
              <h4>分销商-康比特画像分析完成</h4>
              <p>分析模型: DeepSeek-V3</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2026/04/08" placement="top">
              <h4>爆款产品预测: 蛋白粉系列</h4>
              <p>分析结论: 极高潜能</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2026/04/08" placement="top">
              <h4>客诉风险预警</h4>
              <p>京东店铺反馈异常，请及时跟进</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2026/04/07" placement="top">
              <h4>竞品对比分析: 蛋白粉增强版</h4>
              <p>胜率预测: 78%</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats, getDashboardChartData } from '@/api/dashboard'

const stats = ref<any>({})
const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const loadStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res
  } catch (error) {
    console.error('Failed to load stats', error)
  }
}

const initChart = async () => {
  if (!chartRef.value) return

  try {
    const data = await getDashboardChartData()
    
    myChart = echarts.init(chartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['实际销售额', 'AI 预测销售额'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.categories || [],
        axisLine: { lineStyle: { color: '#909399' } }
      },
      yAxis: {
        type: 'value',
        name: '金额 (万元)',
        axisLine: { lineStyle: { color: '#909399' } },
        splitLine: { lineStyle: { type: 'dashed' } }
      },
      series: [
        {
          name: '实际销售额',
          type: 'bar',
          data: data.actual || [],
          itemStyle: { color: '#409EFF' },
          barWidth: '30%'
        },
        {
          name: 'AI 预测销售额',
          type: 'line',
          smooth: true,
          data: data.predict || [],
          itemStyle: { color: '#67C23A' },
          lineStyle: { width: 3 }
        }
      ]
    }
    myChart.setOption(option)
  } catch (error) {
    console.error('Failed to init chart', error)
  }
}

const handleResize = () => {
  myChart?.resize()
}

onMounted(() => {
  loadStats()
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  .stat-card {
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
      margin: 10px 0;
    }
    .stat-footer {
      font-size: 13px;
      color: #909399;
    }
    :deep(.el-card__header) {
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
      color: #606266;
    }
  }
}

.mt-20 {
  margin-top: 20px;
}
</style>
