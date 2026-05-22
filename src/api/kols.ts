import request from '@/utils/request'

// 达人接口类型定义
export interface Kol {
  id: number
  name: string
  platform: string
  fansCount: number
  kolKocFlag: string
  tags?: string
  coopStatus?: number
  salesAmount?: number
  avgOrderValue?: number
  salesVolume?: number
  intro?: string
  avatar?: string
  createTime: string
  updateTime: string
}

export interface KolDashboard {
  basicInfo: Kol
  trendData: Array<{ date: string; fansCount: number }>
  categoryDist: Array<{ category: string; percentage: number; salesAmount: number }>
  conversionMetrics: {
    avgOrderValue: number
    salesVolume: number
    salesAmount: number
    conversionRate: number
  }
}

export interface KolQueryParams {
  platform?: string
  kolKocFlag?: string
  coopStatus?: number
  keyword?: string
  inResourceLibrary?: number
  page?: number
  size?: number
}

/**
 * 获取达人列表
 */
export function getKols(params: KolQueryParams) {
  return request.get<any, any>('/api/v1/kols', { params })
}

/**
 * 根据ID获取达人详情
 */
export function getKolById(id: number) {
  return request.get<any, Kol>(`/api/v1/kols/${id}`)
}

/**
 * 获取达人详情仪表盘数据
 */
export function getKolDashboard(id: number) {
  return request.get<any, KolDashboard>(`/api/v1/kols/${id}/dashboard`)
}

/**
 * 创建达人
 */
export function createKol(data: any) {
  return request.post<any, Kol>('/api/v1/kols', data)
}

/**
 * 更新达人
 */
export function updateKol(id: number, data: any) {
  return request.put<any, Kol>(`/api/v1/kols/${id}`, data)
}

/**
 * 上传头像
 */
export function uploadAvatar(formData: FormData) {
  return request.post<any, string>('/api/v1/kols/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 添加到达人资源库
 */
export function addToResourceLibrary(id: number) {
  return request.post<any, Kol>(`/api/v1/kols/${id}/resource-library`)
}

/**
 * 删除达人
 */
export function deleteKol(id: number) {
  return request.delete<any, void>(`/api/v1/kols/${id}`)
}

/**
 * KOL/KOC智能筛选（AI功能）
 */
export function filterKols(data: any) {
  return request.post<any, any>('/api/v1/kols/ai/filter', data)
}

/**
 * 查询筛选结果
 */
export function getFilterResult(taskId: string) {
  return request.get<any, any>(`/api/v1/kols/ai/filter-result/${taskId}`)
}

/**
 * 筛选历史记录列表
 */
export function getFilterHistory(params: { page?: number; size?: number }) {
  return request.get<any, any>('/api/v1/kols/ai/filter-history', { params })
}

/**
 * 获取达人的合作项目列表
 */
export function getKolCooperations(kolId: number) {
  return request.get<any, any[]>(`/api/v1/kols/${kolId}/cooperations`)
}
