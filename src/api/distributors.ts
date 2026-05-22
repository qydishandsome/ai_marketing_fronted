import request from '@/utils/request'

// 分销商接口类型定义
export interface Distributor {
  id: number
  distName: string
  shopName: string
  managerName: string
  managerPhone: string
  businessLicense?: string
  companyScale?: string
  registeredCapital?: string
  createTime: string
  updateTime: string
}

export interface DistributorProfile {
  id: number
  distId: number
  productId: number
  salesFileUrl?: string
  aiModel: string
  enableSearch: number
  reportContent?: string
  createTime: string
  updateTime: string
}

export interface DistributorQueryParams {
  keyword?: string
  page?: number
  size?: number
}

/**
 * 获取分销商列表
 */
export function getDistributors(params: DistributorQueryParams) {
  return request.get<any, any>('/api/v1/distributors', { params })
}

/**
 * 根据ID获取分销商详情
 */
export function getDistributorById(id: number) {
  return request.get<any, Distributor>(`/api/v1/distributors/${id}`)
}

/**
 * 创建分销商
 */
export function createDistributor(data: any) {
  return request.post<any, Distributor>('/api/v1/distributors', data)
}

/**
 * 更新分销商
 */
export function updateDistributor(id: number, data: any) {
  return request.put<any, Distributor>(`/api/v1/distributors/${id}`, data)
}

/**
 * 删除分销商
 */
export function deleteDistributor(id: number) {
  return request.delete<any, void>(`/api/v1/distributors/${id}`)
}

/**
 * 获取分销商的代理产品列表
 */
export function getDistributorProducts(distId: number) {
  return request.get<any, any[]>(`/api/v1/distributors/${distId}/products`)
}

/**
 * 更新分销商的代理产品列表
 */
export function updateDistributorProducts(distId: number, productIds: number[]) {
  return request.put<any, void>(`/api/v1/distributors/${distId}/products`, productIds)
}

/**
 * 获取分销商的历史画像列表
 */
export function getDistProfiles(distId: number) {
  return request.get<any, DistributorProfile[]>(`/api/v1/distributors/${distId}/profiles`)
}

/**
 * 创建分销商画像分析（AI功能）
 */
export function createDistProfile(distId: number, data: any) {
  return request.post<any, any>(`/api/v1/distributors/${distId}/ai/profile`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 查询画像分析结果
 */
export function getProfileResult(taskId: string) {
  return request.get<any, any>(`/api/v1/distributors/ai/profile-result/${taskId}`)
}

/**
 * 根据ID查询画像记录详情
 */
export function getProfileById(id: number) {
  return request.get<any, DistributorProfile>(`/api/v1/distributors/profiles/${id}`)
}
