import request from '@/utils/request'

export function getCooperations(params: any) {
  return request({
    url: '/api/v1/cooperations',
    method: 'get',
    params
  })
}

export function createCooperation(data: any) {
  return request({
    url: '/api/v1/cooperations',
    method: 'post',
    data
  })
}

export function updateCooperation(id: number, data: any) {
  return request({
    url: `/api/v1/cooperations/${id}`,
    method: 'put',
    data
  })
}

export function deleteCooperation(id: number) {
  return request({
    url: `/api/v1/cooperations/${id}`,
    method: 'delete'
  })
}

export function updateStatus(id: number, status: number) {
  return request({
    url: `/api/v1/cooperations/${id}/status`,
    method: 'put',
    params: { status }
  })
}

export function getStats() {
  return request({
    url: '/api/v1/cooperations/stats',
    method: 'get'
  })
}
