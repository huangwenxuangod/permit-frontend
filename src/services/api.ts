import Taro from '@tarojs/taro'

export type Spec = {
  code: string
  name: string
  widthPx: number
  heightPx: number
  dpi: number
  bgColors?: string[]
  itemId?: number
}

export type Task = {
  id: string
  status: string
  specCode?: string
  spec?: Spec
  itemId?: number
  watermark?: boolean
  beauty?: number
  enhance?: number
  sourceObjectKey?: string
  baselineUrl?: string
  availableColors?: string[]
  processedUrls?: Record<string, string>
  layoutUrls?: Record<string, string>
  errorMsg?: string
  createdAt?: string
  updatedAt?: string
}

export type Order = {
  id?: string
  items?: Array<{ type: string; qty: number }>
  city?: string
  remark?: string
  amountCents?: number
  channel?: string
  status?: string
  createdAt?: string
}

export type PayParams = {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

export type LoginResponse = {
  token: string
  userId: string
  openid: string
}

type RequestOptions = {
  url: string
  method?: 'GET' | 'POST'
  data?: unknown
  header?: Record<string, string>
}

const getBaseUrl = () => process.env.TARO_APP_BASE_URL || ''

const getAuthHeader = () => {
  const token = Taro.getStorageSync('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const request = async <T,>({ url, method = 'GET', data, header }: RequestOptions) => {
  const fullUrl = `${getBaseUrl()}${url}`
  console.log('[api] request', { url: fullUrl, method, data })
  const response = await Taro.request<T>({
    url: fullUrl,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...header
    }
  })
  console.log('[api] response', { url: fullUrl, statusCode: response.statusCode, data: response.data })
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data
  }
  throw new Error(`Request failed: ${response.statusCode}`)
}

const getSpecs = (query?: string) => {
  return request<Spec[]>({
    url: '/api/specs',
    method: 'GET',
    data: query ? { q: query } : undefined
  })
}

const login = (code: string) => {
  return request<LoginResponse>({
    url: '/api/login',
    method: 'POST',
    data: { code }
  })
}

const uploadFile = async (filePath: string) => {
  const response = await Taro.uploadFile({
    url: `${getBaseUrl()}/api/upload`,
    name: 'file',
    filePath
  })
  const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  return data.objectKey as string
}

const createTask = (payload: {
  specCode?: string
  itemId?: number
  sourceObjectKey: string
  defaultBackground?: string
  availableColors?: string[]
  colors?: string[]
  widthPx?: number
  heightPx?: number
  dpi?: number
  beauty?: number
  enhance?: number
  watermark?: boolean
}) => {
  return request<Task>({
    url: '/api/tasks',
    method: 'POST',
    data: payload
  })
}

const getTask = (id: string) => {
  return request<Task>({
    url: `/api/tasks/${id}`,
    method: 'GET'
  })
}

const addBackground = (id: string, color: string, dpi?: number) => {
  return request<{ taskId: string; color: string; url: string; status: string }>({
    url: `/api/tasks/${id}/background`,
    method: 'POST',
    data: { color, dpi }
  })
}

const createLayout = (id: string, payload: { color: string; widthPx: number; heightPx: number; dpi: number; kb?: number }) => {
  return request<{ taskId: string; layout: string; url: string; status: string }>({
    url: `/api/tasks/${id}/layout`,
    method: 'POST',
    data: payload
  })
}

const createOrder = (payload: {
  taskId: string
  items: Array<{ type: string; qty: number }>
  city: string
  remark?: string
  amountCents: number
  channel: string
}) => {
  return request<Order>({
    url: '/api/orders',
    method: 'POST',
    data: payload
  })
}

const getOrders = (page = 1, pageSize = 20) => {
  return request<{ items: Order[]; page: number; pageSize: number; total: number }>({
    url: '/api/orders',
    method: 'GET',
    data: { page, pageSize }
  })
}

const getDownloadInfo = (taskId: string) => {
  return request<{ taskId: string; urls: Record<string, string>; expiresIn: number }>({
    url: `/api/download/${taskId}`,
    method: 'GET'
  })
}

const createDownloadToken = (taskId: string, ttlSeconds = 600) => {
  return request<{ token: string; expiresAt: string }>({
    url: '/api/download/token',
    method: 'POST',
    data: { taskId, ttlSeconds }
  })
}

const payWechat = (orderId: string, openid?: string) => {
  return request<{ orderId: string; payParams: PayParams }>({
    url: '/api/pay/wechat',
    method: 'POST',
    data: openid ? { orderId, openid } : { orderId }
  })
}

const getMe = () => {
  return request<{ userId: string; openid: string; nickname: string; avatar: string }>({
    url: '/api/me',
    method: 'GET'
  })
}

export const api = {
  login,
  getSpecs,
  uploadFile,
  createTask,
  getTask,
  addBackground,
  createLayout,
  createOrder,
  getOrders,
  getDownloadInfo,
  createDownloadToken,
  payWechat,
  getMe
}
