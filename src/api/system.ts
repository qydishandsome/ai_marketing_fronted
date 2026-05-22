import request from '@/utils/request'

// 通用查询参数
export interface BaseQueryParams {
  keyword?: string
  page?: number
  size?: number
}

// 用户组
export interface UserGroup {
  id?: number
  groupName?: string
  permissions?: string
  userCount?: number
  status?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

// 用户
export interface User {
  id?: number
  name?: string
  password?: string
  phone?: string
  groupId?: number
  deptId?: number
  status?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

// 部门
export interface Department {
  id?: number
  deptName?: string
  status?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

/**
 * 用户组API
 */
export const userGroups = {
  getList: (params: BaseQueryParams) =>
    request.get<any, any>('/api/v1/user-groups', { params }),

  getById: (id: number) =>
    request.get<any, UserGroup>(`/api/v1/user-groups/${id}`),

  create: (data: UserGroup) =>
    request.post<any, UserGroup>('/api/v1/user-groups', data),

  update: (id: number, data: UserGroup) =>
    // 后端使用同一个POST接口处理新建和编辑
    request.post<any, UserGroup>('/api/v1/user-groups', { ...data, id }),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/user-groups/${id}`)
}

/**
 * 用户API
 */
export const users = {
  getList: (params: { deptId?: number; page?: number; size?: number }) =>
    request.get<any, any>('/api/v1/users', { params }),

  getById: (id: number) =>
    request.get<any, User>(`/api/v1/users/${id}`),

  create: (data: User) =>
    request.post<any, User>('/api/v1/users', data),

  update: (id: number, data: User) =>
    // 后端使用同一个POST接口处理新建和编辑
    request.post<any, User>('/api/v1/users', { ...data, id }),

  delete: (id: number) =>
    request.delete<any, void>(`/api/v1/users/${id}`)
}

/**
 * 部门API
 */
export const departments = {
  getAll: () =>
    request.get<any, Department[]>('/api/v1/depts'),

  create: (data: Department) =>
    request.post<any, Department>('/api/v1/depts', data),

  update: (id: number, data: Department) =>
    // 后端使用同一个POST接口处理新建和编辑
    request.post<any, Department>('/api/v1/depts', { ...data, id })
}
