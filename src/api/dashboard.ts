import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  return request.get<any, any>('/api/v1/dashboard/stats')
}

/**
 * 获取仪表盘图表数据
 */
export function getDashboardChartData() {
  return request.get<any, any>('/api/v1/dashboard/chart-data')
}
