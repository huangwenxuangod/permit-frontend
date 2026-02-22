import Taro from '@tarojs/taro'
import { getToken } from './auth'

const DEFAULT_API_BASE_URL = 'https://huangwenxuangod.xyz/api'
const API_BASE_URL_KEY = 'apiBaseUrl'
const ASSETS_BASE_URL_KEY = 'assetsBaseUrl'

const getApiBaseUrl = () => {
  const fromStorage = Taro.getStorageSync(API_BASE_URL_KEY)
  const raw = (fromStorage || DEFAULT_API_BASE_URL) as string
  return String(raw || '').trim().replace(/\/+$/, '')
}

const getAssetsBaseUrl = () => {
  const fromStorage = Taro.getStorageSync(ASSETS_BASE_URL_KEY)
  const apiBase = getApiBaseUrl()
  const fallback = apiBase.replace(/\/api.*$/, '')
  const raw = (fromStorage || fallback) as string
  return String(raw || '').trim().replace(/\/+$/, '')
}

const toAbsolute = (url?: string) => {
  if (!url) return url as any
  if (typeof url !== 'string') return url as any
  const clean = url.trim()
  const baseOrigin = getAssetsBaseUrl()
  if (/^https?:\/\//.test(clean)) {
    return clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, baseOrigin)
  }
  if (clean.startsWith('/')) return `${baseOrigin}${clean}`
  return clean
}

const normalizeUrlMap = (map?: Record<string, string>) => {
  if (!map) return map
  const next = { ...map }
  Object.keys(next).forEach(k => {
    next[k] = toAbsolute(next[k])
  })
  return next
}

const normalizeTask = (data: any) => {
  if (!data) return data
  if (data.url) data.url = toAbsolute(data.url)
  if (data.layoutUrl) data.layoutUrl = toAbsolute(data.layoutUrl)
  if (data.baselineUrl) data.baselineUrl = toAbsolute(data.baselineUrl)
  if (data.processedUrls) data.processedUrls = normalizeUrlMap(data.processedUrls)
  if (data.layoutUrls) data.layoutUrls = normalizeUrlMap(data.layoutUrls)
  if (data.urls) data.urls = normalizeUrlMap(data.urls)
  return data
}

const isOpCodeOk = (value: any) => {
  if (value === 0 || value === '0') return true
  if (value === 200 || value === '200') return true
  if (typeof value === 'string') {
    const upper = value.toUpperCase()
    if (upper === 'OK' || upper === 'SUCCESS') return true
  }
  return false
}

const ensureSuccess = (data: any, fallbackMessage: string) => {
  if (!data) return
  if (data.error) throw new Error(data.error.message || fallbackMessage)
  const opCode = data.opCode ?? data.opcode ?? data.code ?? data.statusCode
  if (opCode === undefined || opCode === null) return
  if (!isOpCodeOk(opCode)) {
    const message = data.message || data.msg || data.opMsg || data.errorMsg || fallbackMessage
    throw new Error(message)
  }
}

const unwrapData = (data: any) => {
  if (!data) return data
  if (data.data) return data.data
  if (data.result) return data.result
  return data
}

const buildDownloadFileUrl = (token: string) => `${getApiBaseUrl()}/download/file?token=${encodeURIComponent(token)}`

const createIdempotencyKey = () => `mini-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
const createRequestId = () => `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export async function getSpecs() {
  const res = await Taro.request({ url: `${getApiBaseUrl()}/zjz/item/list`, method: 'GET' })
  const data = res.data as any
  ensureSuccess(data, 'Specs error')
  const payload = unwrapData(data)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.list)) return payload.list
  return []
}

export async function getZjzItem(itemId: number | string) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/zjz/item/get`,
    method: 'GET',
    data: { itemId }
  })
  const data = res.data as any
  ensureSuccess(data, 'Item error')
  return unwrapData(data)
}

export async function login(code: string) {
  try {
    console.log('api.login payload:', { code })
  } catch {}
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/login`,
    method: 'POST',
    data: { code },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Login error')
  return unwrapData(data)
}

export async function me() {
  const res = await Taro.request({ url: `${getApiBaseUrl()}/me`, method: 'GET' })
  const data = res.data as any
  ensureSuccess(data, 'Me error')
  return unwrapData(data)
}

// 已取消绑定手机号能力：不再导出 bindPhoneNumber

export async function uploadImage(filePath: string) {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const requestId = createRequestId()
  headers['X-Request-Id'] = requestId
  const url = `${getApiBaseUrl()}/upload`
  let fileSize: number | undefined
  let networkType: string | undefined
  try {
    const fileInfo = await Taro.getFileInfo({ filePath })
    if ('size' in fileInfo) {
      fileSize = fileInfo.size
    }
  } catch {}
  try {
    const net = await Taro.getNetworkType()
    networkType = net.networkType
  } catch {}
  let res: Taro.uploadFile.SuccessCallbackResult
  try {
    res = await Taro.uploadFile({
      url,
      filePath,
      name: 'file',
      formData: {},
      header: headers
    })
  } catch (error) {
    try {
      console.log('upload failure:', { requestId, url, fileSize, networkType, error })
    } catch {}
    const err = new Error('Upload error')
    ;(err as any).requestId = requestId
    ;(err as any).upload = { url, fileSize, networkType }
    ;(err as any).origin = error
    throw err
  }
  const data = JSON.parse(res.data as any)
  if (data && data.error) {
    try {
      console.log('upload failure:', { requestId, url, fileSize, networkType, error: data.error })
    } catch {}
    const err = new Error(data.error.message || 'Upload error')
    ;(err as any).requestId = requestId
    ;(err as any).upload = { url, fileSize, networkType }
    throw err
  }
  ensureSuccess(data, 'Upload error')
  return data.objectKey as string
}

export async function createTask(payload: {
  specCode: string
  itemId: number | string
  sourceObjectKey: string
  widthPx: number
  heightPx: number
  dpi: number
  defaultBackground?: string
  availableColors?: string[]
  colors?: string[]
  beauty?: number
  enhance?: number
  watermark?: boolean
}) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/task/create`,
    method: 'POST',
    data: payload,
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Task error')
  return normalizeTask(unwrapData(data))
}

export async function getTask(id: string) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/task/get`,
    method: 'GET',
    data: { id }
  })
  const data = res.data as any
  ensureSuccess(data, 'Get task error')
  return normalizeTask(unwrapData(data))
}

export async function generateBackground(id: string, color: string, dpi?: number, render?: number, kb?: number) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/tasks/${id}/background`,
    method: 'POST',
    data: { color, dpi, render, kb },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Background error')
  return normalizeTask(unwrapData(data))
}

export async function generateLayout(id: string, color: string, widthPx: number, heightPx: number, dpi: number, kb?: number) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/tasks/${id}/layout`,
    method: 'POST',
    data: { color, widthPx, heightPx, dpi, kb },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Layout error')
  return normalizeTask(unwrapData(data))
}

export async function getDownloadInfo(taskId: string) {
  const res = await Taro.request({ url: `${getApiBaseUrl()}/download/${taskId}`, method: 'GET' })
  const data = res.data as any
  ensureSuccess(data, 'Download error')
  const payload = unwrapData(data)
  if (payload && payload.url) payload.url = toAbsolute(payload.url)
  if (payload && payload.urls) payload.urls = normalizeUrlMap(payload.urls)
  return payload
}

export async function createDownloadToken(taskId: string, ttlSeconds = 600) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/download/token`,
    method: 'POST',
    data: { taskId, ttlSeconds },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Download token error')
  return unwrapData(data)
}

export function getDownloadFileUrl(token: string) {
  return buildDownloadFileUrl(token)
}

export async function createOrder(payload: { taskId: string, items: any[], city: string, remark: string, amountCents: number, channel: string }) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/orders`,
    method: 'POST',
    data: payload,
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  ensureSuccess(data, 'Order error')
  return unwrapData(data)
}

export async function payWechat(orderId: string) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/pay/wechat`,
    method: 'POST',
    data: { orderId },
    header: { 'Content-Type': 'application/json', 'Idempotency-Key': createIdempotencyKey() }
  })
  const data = res.data as any
  ensureSuccess(data, 'Pay wechat error')
  return unwrapData(data)
}

export async function payDouyin(orderId: string) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/pay/douyin`,
    method: 'POST',
    data: { orderId },
    header: { 'Content-Type': 'application/json', 'Idempotency-Key': createIdempotencyKey() }
  })
  const data = res.data as any
  ensureSuccess(data, 'Pay douyin error')
  return unwrapData(data)
}

export async function getOrders(params?: { page?: number; pageSize?: number; status?: string; channel?: string }) {
  const res = await Taro.request({
    url: `${getApiBaseUrl()}/orders`,
    method: 'GET',
    data: params || {},
  })
  const data = res.data as any
  ensureSuccess(data, 'Orders error')
  return unwrapData(data)
}
