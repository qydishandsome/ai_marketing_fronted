import request from '@/utils/request'

// AI分析任务结果
export interface TaskResult {
  taskId: string
  status: string
  result?: string
  error?: string
  createTime: string
  updateTime: string
}

// 爆款预测记录
export interface HitPredict {
  id?: number
  productId?: number
  audienceId?: number
  predictCycle?: string
  aiModel?: string
  reportContent?: string
  status?: number
  createTime?: string
  updateTime?: string
}

// 竞品信息
export interface Competitor {
  id?: number
  baseProductId?: number
  compName?: string
  compDetail?: string
  salesPlatform?: string
  salesAmount?: number
  kolKocNames?: string
  aiReportContent?: string
  createTime?: string
  updateTime?: string
}

/**
 * AI新品爆款预测
 */
export function predictHit(params: any) {
  return request.post<any, { taskId: string; message: string }>('/api/v1/ai/products/predict-hit', params)
}

/**
 * 查询预测结果
 */
export function getPredictResult(taskId: string) {
  return request.get<any, TaskResult>(`/api/v1/ai/products/predict-result/${taskId}`)
}

/**
 * AI竞品对比分析
 */
export function analyzeCompetitors(params: any) {
  return request.post<any, { taskId: string; message: string }>('/api/v1/ai/products/analyze-competitors', params)
}

/**
 * 查询竞品分析结果
 */
export function getAnalyzeResult(taskId: string) {
  return request.get<any, TaskResult>(`/api/v1/ai/products/analyze-result/${taskId}`)
}

/**
 * 获取爆款预测列表
 */
export function getHitPredicts(params: { productId?: number; page?: number; size?: number }) {
  return request.get<any, any>('/api/v1/hit-predicts', { params })
}

/**
 * 保存预测记录
 */
export function saveHitPredict(params: any) {
  return request.post<any, HitPredict>('/api/v1/hit-predicts', params)
}

/**
 * 根据ID查询预测记录
 */
export function getHitPredictById(id: number) {
  return request.get<any, HitPredict>(`/api/v1/hit-predicts/${id}`)
}

/**
 * 删除预测记录
 */
export function deleteHitPredict(id: number) {
  return request.delete<any, void>(`/api/v1/hit-predicts/${id}`)
}

/**
 * 获取竞品列表
 */
export function getCompetitors(params: { baseProductId?: number; page?: number; size?: number }) {
  return request.get<any, any>('/api/v1/competitors', { params })
}

/**
 * 根据ID查询竞品
 */
export function getCompetitorById(id: number) {
  return request.get<any, Competitor>(`/api/v1/competitors/${id}`)
}

/**
 * 创建竞品
 */
export function createCompetitor(data: Competitor) {
  return request.post<any, Competitor>('/api/v1/competitors', data)
}

/**
 * 更新竞品
 */
export function updateCompetitor(id: number, data: Competitor) {
  return request.put<any, Competitor>(`/api/v1/competitors/${id}`, data)
}

/**
 * 删除竞品
 */
export function deleteCompetitor(id: number) {
  return request.delete<any, void>(`/api/v1/competitors/${id}`)
}

/**
 * 历史爆款记录
 */
export interface HistoryBurst {
  id?: number
  productId?: number
  productName?: string
  specification?: string
  brand?: string
  category?: string
  planning?: string
  distributor?: string
  platform?: string
  salesAmount?: number
  salesVolume?: number
  kol?: string
  report?: string
  updateTime?: string
}

/**
 * 获取历史爆款列表
 */
export function getHistoryBursts(params: {
  category?: string
  brand?: string
  productName?: string
  distributor?: string
  platform?: string
  kol?: string
  page?: number
  size?: number
}) {
  return request.get<any, any>('/api/v1/history-bursts', { params })
}

/**
 * 创建历史爆款
 */
export function createHistoryBurst(data: HistoryBurst) {
  return request.post<any, HistoryBurst>('/api/v1/history-bursts', data)
}

/**
 * 更新历史爆款
 */
export function updateHistoryBurst(id: number, data: HistoryBurst) {
  return request.put<any, HistoryBurst>(`/api/v1/history-bursts/${id}`, data)
}

/**
 * 删除历史爆款
 */
export function deleteHistoryBurst(id: number) {
  return request.delete<any, void>(`/api/v1/history-bursts/${id}`)
}

/**
 * 历史爆款AI分析
 */
export function analyzeHistoryBurst(params: any) {
  return request.post<any, { taskId: string; message: string }>('/api/v1/ai/history-bursts/analyze', params)
}
