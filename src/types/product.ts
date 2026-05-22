// 产品相关类型定义
export interface Product {
  id?: number
  name: string
  sku: string
  specification?: string
  categoryId?: number
  brandId?: number
  detail?: string
  detailFileUrl?: string
  manualFileUrl?: string
  status?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

export interface ProductType {
  id: number
  name: string
  description?: string
}

export interface Brand {
  id: number
  name: string
  description?: string
}

export interface Platform {
  id: number
  name: string
  description?: string
}
