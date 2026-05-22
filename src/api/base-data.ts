import request from '@/utils/request'

// 通用查询参数
export interface BaseQueryParams {
  keyword?: string
  page?: number
  size?: number
}

// 通用数据接口
export interface BaseEntity {
  id?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

// 产品类型
export interface ProductType extends BaseEntity {
  typeName?: string
  description?: string
}

// 品牌
export interface Brand extends BaseEntity {
  brandName?: string
  productName?: string
  specification?: string
  description?: string
}

// 平台
export interface Platform extends BaseEntity {
  platformName?: string
  description?: string
}

// 部门
export interface Department extends BaseEntity {
  deptName?: string
  status?: number
}

// 用户组
export interface UserGroup extends BaseEntity {
  groupName?: string
  permissions?: string
  userCount?: number
  status?: number
}

// 用户
export interface User extends BaseEntity {
  name?: string
  password?: string
  phone?: string
  groupId?: number
  deptId?: number
  status?: number
}

/**
 * 产品类型API
 */
export const productTypes = {
  getList: (params: BaseQueryParams) =>
    request.get<any, any>('/api/v1/product-types', { params }),

  getAll: () =>
    request.get<any, ProductType[]>('/api/v1/product-types/all'),

  getById: (id: number) =>
    request.get<any, ProductType>(`/api/v1/product-types/${id}`),

  create: (data: ProductType) =>
    request.post<any, ProductType>('/api/v1/product-types', data),

  update: (id: number, data: ProductType) =>
    request.put<any, ProductType>(`/api/v1/product-types/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/product-types/${id}`)
}

/**
 * 品牌API
 */
export const brands = {
  getList: (params: BaseQueryParams) =>
    request.get<any, any>('/api/v1/brands', { params }),

  getAll: () =>
    request.get<any, Brand[]>('/api/v1/brands/all'),

  getById: (id: number) =>
    request.get<any, Brand>(`/api/v1/brands/${id}`),

  create: (data: Brand) =>
    request.post<any, Brand>('/api/v1/brands', data),

  update: (id: number, data: Brand) =>
    request.put<any, Brand>(`/api/v1/brands/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/brands/${id}`)
}

/**
 * 平台API
 */
export const platforms = {
  getList: (params: BaseQueryParams) =>
    request.get<any, any>('/api/v1/platforms', { params }),

  getAll: () =>
    request.get<any, Platform[]>('/api/v1/platforms/all'),

  getById: (id: number) =>
    request.get<any, Platform>(`/api/v1/platforms/${id}`),

  create: (data: Platform) =>
    request.post<any, Platform>('/api/v1/platforms', data),

  update: (id: number, data: Platform) =>
    request.put<any, Platform>(`/api/v1/platforms/${id}`, data),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/platforms/${id}`)
}
