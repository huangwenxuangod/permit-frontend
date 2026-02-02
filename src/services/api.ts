import Taro from '@tarojs/taro'
const BASE_URL = 'http://localhost:5000/api'

export async function getSpecs() {
  const res = await Taro.request({ url: `${BASE_URL}/specs`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Specs error')
  return data
}

export async function uploadImage(filePath: string) {
  const res = await Taro.uploadFile({
    url: `${BASE_URL}/upload`,
    filePath,
    name: 'file',
    formData: {}
  })
  const data = JSON.parse(res.data as any)
  if (data && data.error) throw new Error(data.error.message || 'Upload error')
  return data.objectKey as string
}

export async function createTask(payload: { specCode: string, sourceObjectKey: string, widthPx: number, heightPx: number, dpi: number, defaultBackground?: string }) {
  const res = await Taro.request({
    url: `${BASE_URL}/tasks`,
    method: 'POST',
    data: payload,
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Task error')
  return data
}

export async function getTask(id: string) {
  const res = await Taro.request({ url: `${BASE_URL}/tasks/${id}`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Get task error')
  return data
}

export async function generateBackground(id: string, color: string, dpi?: number, render?: number, kb?: number) {
  const res = await Taro.request({
    url: `${BASE_URL}/tasks/${id}/background`,
    method: 'POST',
    data: { color, dpi, render, kb },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Background error')
  return data
}

export async function generateLayout(id: string, color: string, widthPx: number, heightPx: number, dpi: number, kb?: number) {
  const res = await Taro.request({
    url: `${BASE_URL}/tasks/${id}/layout`,
    method: 'POST',
    data: { color, widthPx, heightPx, dpi, kb },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Layout error')
  return data
}

export async function getDownloadInfo(taskId: string) {
  const res = await Taro.request({ url: `${BASE_URL}/download/${taskId}`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Download error')
  return data
}

export async function createOrder(payload: { taskId: string, items: any[], city: string, remark: string, amountCents: number, channel: string }) {
  const res = await Taro.request({
    url: `${BASE_URL}/orders`,
    method: 'POST',
    data: payload,
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Order error')
  return data
}
