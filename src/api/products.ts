import request from '@/utils/request'
import type { Product } from '@/types/product'

// 产品接口类型定义
export interface ProductStats {
  total: number
  onShelf: number
  offShelf: number
  momRate: string
}

export interface ProductListResponse {
  stats: ProductStats
  list: Product[]
  total: number
}

export interface ProductQueryParams {
  categoryId?: number
  brandId?: number
  keyword?: string
  status?: number
  page?: number
  size?: number
}

/**
 * 获取产品列表（含统计看板）
 */
export function getProducts(params: ProductQueryParams) {
  return request.get<any, ProductListResponse>('/api/v1/products', { params })
}

/**
 * 根据ID获取产品详情
 */
export function getProductById(id: number) {
  return request.get<any, Product>(`/api/v1/products/${id}`)
}

/**
 * 创建产品
 */
export function createProduct(data: any) {
  return request.post<any, Product>('/api/v1/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 更新产品
 */
export function updateProduct(id: number, data: any) {
  return request.put<any, Product>(`/api/v1/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 删除产品
 */
export function deleteProduct(id: number) {
  return request.delete<any, void>(`/api/v1/products/${id}`)
}
