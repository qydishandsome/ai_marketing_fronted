import request from '@/utils/request'

// 合作项目
export interface Cooperation {
  id?: number
  projectName?: string
  productId?: number
  productName?: string
  kolId?: number
  kolName?: string
  deptId?: number
  manager?: string
  cooperationType?: string
  startTime?: string
  endTime?: string
  fee?: number
  contractFile?: string
  createTime?: string
  updateTime?: string
}

// 预测人群
export interface Audience {
  id?: number
  audienceType?: string
  typeDesc?: string
  useCount?: number
  createTime?: string
}

// 达人筛选策略
export interface InfluencerStrategy {
  id?: number
  strategyName?: string
  category?: string
  description?: string
  useCount?: number
}

// 价格监控
export interface PriceMonitor {
  id?: number
  productId?: number
  guidePrice?: number
  currentPrice?: number
  platform?: string
  trend?: string
  warning?: string
}

// 库存预测
export interface InventoryPred {
  id?: number
  productId?: number
  timeRange?: string
  aiModel?: string
  reportContent?: string
}

// 风险识别
export interface ComplaintRisk {
  id?: number
  distributorId?: number
  productId?: number
  platformUrl?: string
  commentCount?: number
  riskLevel?: string
  reportContent?: string
}

/**
 * 合作项目API
 */
export const cooperations = {
  getList: (params: any) =>
    request.get<any, any>('/api/v1/cooperations', { params }),

  getById: (id: number) =>
    request.get<any, Cooperation>(`/api/v1/cooperations/${id}`),

  create: (data: Cooperation) =>
    request.post<any, Cooperation>('/api/v1/cooperations', data),

  update: (id: number, data: Cooperation) =>
    request.put<any, Cooperation>(`/api/v1/cooperations/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/cooperations/${id}`)
}

/**
 * 预测人群API
 */
export const audiences = {
  getList: (params: { keyword?: string; useCountOrder?: string; timeOrder?: string; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/audiences', { params }),

  getById: (id: number) =>
    request.get<any, Audience>(`/api/v1/audiences/${id}`),

  create: (data: Audience) =>
    request.post<any, Audience>('/api/v1/audiences', data),

  update: (id: number, data: Audience) =>
    request.put<any, Audience>(`/api/v1/audiences/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/audiences/${id}`)
}

/**
 * 价格监控API
 */
export const priceMonitors = {
  getList: (params: { productId?: number; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/price-monitor', { params }),

  getById: (id: number) =>
    request.get<any, PriceMonitor>(`/api/v1/price-monitor/${id}`),

  getStats: () =>
    request.get<any, any>('/api/v1/price-monitor/stats'),

  getAlerts: () =>
    request.get<any, any>('/api/v1/price-monitor/alerts'),

  create: (data: PriceMonitor) =>
    request.post<any, PriceMonitor>('/api/v1/price-monitor', data),

  update: (id: number, data: PriceMonitor) =>
    request.put<any, PriceMonitor>(`/api/v1/price-monitor/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/price-monitor/${id}`)
}

/**
 * 库存预测API
 */
export const inventoryPreds = {
  getList: (params: { productId?: number; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/inventory-pred', { params }),

  getById: (id: number) =>
    request.get<any, InventoryPred>(`/api/v1/inventory-pred/${id}`),

  getResult: (taskId: string) =>
    request.get<any, any>(`/api/v1/inventory-pred/result/${taskId}`),

  create: (data: any) =>
    request.post<any, any>('/api/v1/inventory-pred', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(data) => {
        const formData = new FormData()
        formData.append('productId', data.productId)
        formData.append('startDate', data.startDate)
        formData.append('endDate', data.endDate)
        formData.append('salesFile', data.salesFile)
        formData.append('planFile', data.planFile)
        formData.append('aiModel', data.aiModel || 'deepseek')
        return formData
      }]
    }),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/inventory-pred/${id}`)
}

/**
 * 风险识别API
 */
export const complaintRisks = {
  getList: (params: { distId?: number; productId?: number; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/complaint-risk', { params }),

  getById: (id: number) =>
    request.get<any, ComplaintRisk>(`/api/v1/complaint-risk/${id}`),

  create: (data: any) =>
    request.post<any, any>('/api/v1/complaint-risk/analyze', data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/complaint-risk/${id}`)
}

/**
 * 达人筛选策略API
 */
export const influencerStrategies = {
  getList: (params: { strategyName?: string; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/influencer-strategies', { params }),

  getById: (id: number) =>
    request.get<any, InfluencerStrategy>(`/api/v1/influencer-strategies/${id}`),

  create: (data: any) =>
    request.post<any, InfluencerStrategy>('/api/v1/influencer-strategies', data),

  update: (id: number, data: any) =>
    request.put<any, InfluencerStrategy>(`/api/v1/influencer-strategies/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/influencer-strategies/${id}`)
}

/**
 * AI分析API
 */
export const aiAnalysis = {
  getList: (params: { status?: string; aiModel?: string; createTime?: string; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/ai/analysis', { params }),

  getById: (id: number) =>
    request.get<any, any>(`/api/v1/ai/analysis/${id}`),

  create: (data: any) =>
    request.post<any, any>('/api/v1/ai/analysis/custom', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(data) => {
        const formData = new FormData()
        formData.append('analysisName', data.analysisName || data.name)
        formData.append('promptDesc', data.promptDesc || data.description || '')
        formData.append('aiModel', data.aiModel || 'deepseek')
        formData.append('enableSearch', data.enableSearch ? 'true' : 'false')
        if (data.files && data.files.length > 0) {
          data.files.forEach((file: any) => {
            formData.append('files', file.raw || file)
          })
        }
        return formData
      }]
    }),

  update: (id: number, data: any) =>
    request.post<any, any>(`/api/v1/ai/analysis/custom`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(data) => {
        const formData = new FormData()
        formData.append('id', id.toString())
        formData.append('analysisName', data.analysisName || data.name)
        formData.append('promptDesc', data.promptDesc || data.description || '')
        formData.append('aiModel', data.aiModel || 'deepseek')
        formData.append('enableSearch', data.enableSearch ? 'true' : 'false')
        if (data.files && data.files.length > 0) {
          data.files.forEach((file: any) => {
            formData.append('files', file.raw || file)
          })
        }
        return formData
      }]
    }),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/ai/analysis/${id}`)
}
