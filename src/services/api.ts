import Taro from '@tarojs/taro'

const BASE_URL = 'http://47.107.40.219:5000/api'
const BASE_ORIGIN = BASE_URL.replace(/\/api.*$/, '')

const toAbsolute = (url?: string) => {
  if (!url) return url as any
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('/')) return `${BASE_ORIGIN}${url}`
  return url
}

const normalizeTask = (data: any) => {
  if (!data) return data
  if (data.baselineUrl) data.baselineUrl = toAbsolute(data.baselineUrl)
  if (data.processedUrls) {
    const map = data.processedUrls
    Object.keys(map || {}).forEach(k => {
      map[k] = toAbsolute(map[k])
    })
    data.processedUrls = map
  }
  return data
}

const createIdempotencyKey = () => `mini-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export async function getSpecs() {
  const res = await Taro.request({ url: `${BASE_URL}/specs`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Specs error')
  return data
}

export async function login(code: string) {
  const env = process.env.TARO_ENV || ''
  const provider = env || 'weapp'
  try {
    console.log('api.login payload:', { code, provider })
  } catch {}
  const res = await Taro.request({
    url: `${BASE_URL}/login`,
    method: 'POST',
    data: { code, provider },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Login error')
  return data
}

export async function me() {
  const res = await Taro.request({ url: `${BASE_URL}/me`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Me error')
  return data
}

// 已取消绑定手机号能力：不再导出 bindPhoneNumber

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
  return normalizeTask(data)
}

export async function getTask(id: string) {
  const res = await Taro.request({ url: `${BASE_URL}/tasks/${id}`, method: 'GET' })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Get task error')
  return normalizeTask(data)
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
  return normalizeTask(data)
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
  return normalizeTask(data)
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

export async function payWechat(orderId: string) {
  const res = await Taro.request({
    url: `${BASE_URL}/pay/wechat`,
    method: 'POST',
    data: { orderId },
    header: { 'Content-Type': 'application/json', 'Idempotency-Key': createIdempotencyKey() }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Pay wechat error')
  return data
}

export async function payDouyin(orderId: string) {
  const res = await Taro.request({
    url: `${BASE_URL}/pay/douyin`,
    method: 'POST',
    data: { orderId },
    header: { 'Content-Type': 'application/json', 'Idempotency-Key': createIdempotencyKey() }
  })
  const data = res.data as any
  if (data && data.error) throw new Error(data.error.message || 'Pay douyin error')
  return data
}
