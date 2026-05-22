import request from '@/utils/request'

export function getList(params: any) {
  return request({
    url: '/api/v1/complaint-risk',
    method: 'get',
    params
  })
}

export function create(data: any) {
  return request({
    url: '/api/v1/complaint-risk/analyze',
    method: 'post',
    data
  })
}

export function deleteRisk(id: number) {
  return request({
    url: `/api/v1/complaint-risk/${id}`,
    method: 'delete'
  })
}

export function getResult(taskId: string) {
  return request({
    url: `/api/v1/complaint-risk/result/${taskId}`,
    method: 'get'
  })
}
