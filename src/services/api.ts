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

type FaceEnhanceResp = {
  code: number
  msg: string
  data?: { image?: string }
}

type AIPhotoMakeResp = {
  code: number
  msg: string
  data?: { estimated_time?: number; pic_id?: number }
}

type RequestOptions = {
  url: string
  method?: 'GET' | 'POST'
  data?: unknown
  header?: Record<string, string>
}

const getBaseUrl = () => 	'https://huangwenxuangod.xyz'

const getAuthHeader = () => {
  const token = Taro.getStorageSync('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let authPromise: Promise<void> | null = null

const ensureAuth = async () => {
  const token = Taro.getStorageSync('token')
  if (token) {
    console.log('[api] ensureAuth: token exists')
    return
  }
  console.log('[api] ensureAuth: start')
  if (authPromise) return authPromise
  authPromise = new Promise<void>((resolve, reject) => {
    Taro.login({
      success: async (result) => {
        if (!result.code) {
          console.error('[api] ensureAuth: login code missing')
          reject(new Error('Login code missing'))
          return
        }
        try {
          const response = await Taro.request<LoginResponse>({
            url: `${getBaseUrl()}/api/login`,
            method: 'POST',
            data: { code: result.code },
            header: { 'Content-Type': 'application/json' }
          })
          console.log('[api] ensureAuth: login response', { statusCode: response.statusCode })
          if (response.statusCode >= 200 && response.statusCode < 300) {
            const data = response.data
            Taro.setStorageSync('token', data.token)
            Taro.setStorageSync('userId', data.userId)
            Taro.setStorageSync('openid', data.openid)
            console.log('[api] ensureAuth: token stored')
            resolve()
            return
          }
          reject(new Error(`Login failed: ${response.statusCode}`))
        } catch (error) {
          console.error('[api] ensureAuth: request error', { error: String(error) })
          reject(error)
        }
      },
      fail: (error) => {
        console.error('[api] ensureAuth: login fail', { error: String(error) })
        reject(error)
      }
    })
  }).finally(() => {
    authPromise = null
  })
  return authPromise
}

const request = async <T,>({ url, method = 'GET', data, header }: RequestOptions) => {
  const baseUrl = getBaseUrl()
  const fullUrl = `${baseUrl}${url}`
  console.log('[api] request', { url: fullUrl, method, data, baseUrl })
  if (!baseUrl) {
    console.log('[api] baseUrl empty')
  }
  try {
    if (url !== '/api/login') {
      await ensureAuth()
    }
    const hasToken = !!Taro.getStorageSync('token')
    if (!hasToken && url !== '/api/login') {
      console.error('[api] request blocked: token missing')
      throw new Error('Token missing after login')
    }
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
    if (response.statusCode === 401 && url !== '/api/login') {
      console.error('[api] response unauthorized, retry login')
      Taro.removeStorageSync('token')
      await ensureAuth()
      const retryResponse = await Taro.request<T>({
        url: fullUrl,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...header
        }
      })
      console.log('[api] response retry', { url: fullUrl, statusCode: retryResponse.statusCode, data: retryResponse.data })
      if (retryResponse.statusCode >= 200 && retryResponse.statusCode < 300) {
        return retryResponse.data
      }
      throw new Error(`Request failed: ${retryResponse.statusCode}`)
    }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data
    }
    throw new Error(`Request failed: ${response.statusCode}`)
  } catch (error) {
    console.error('[api] request error', { url: fullUrl, method, data, error: String(error) })
    throw error
  }
}

const createIdempotencyKey = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const getSpecs = (query?: string) => {
  console.log('[api] getSpecs', { query })
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
  const url = `${getBaseUrl()}/api/upload`
  console.log('[api] upload request', { url, filePath })
  const ensureToken = async () => {
    await ensureAuth()
    const hasToken = !!Taro.getStorageSync('token')
    if (!hasToken) {
      throw new Error('Token missing after login')
    }
  }
  const doUpload = () => Taro.uploadFile({
    url,
    name: 'file',
    filePath,
    header: {
      ...getAuthHeader()
    }
  })
  await ensureToken()
  let response = await doUpload()
  let data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  console.log('[api] upload response', { url, statusCode: response.statusCode, data })
  if (response.statusCode === 401) {
    console.error('[api] upload unauthorized, retry login')
    Taro.removeStorageSync('token')
    await ensureToken()
    response = await doUpload()
    data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
    console.log('[api] upload response retry', { url, statusCode: response.statusCode, data })
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Upload failed: ${response.statusCode}`)
  }
  return data.objectKey as string
}

const createTask = (payload: {
  specCode?: string
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
  return request<{
    taskId: string
    urls: Record<string, string>
    receiptUrls?: Record<string, string>
    layoutUrls?: Record<string, string>
    expiresIn: number
  }>({
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
    data: openid ? { orderId, openid } : { orderId },
    header: { 'Idempotency-Key': createIdempotencyKey() }
  })
}

const payCallback = (orderId: string, status: 'paid' | 'failed' | 'canceled') => {
  return request<{ orderId: string; status: string }>({
    url: '/api/pay/callback',
    method: 'POST',
    data: { orderId, status },
    header: { 'Idempotency-Key': createIdempotencyKey() }
  })
}

const getMe = () => {
  return request<{ userId: string; openid: string; nickname: string; avatar: string }>({
    url: '/api/me',
    method: 'GET'
  })
}

const faceEnhance = (payload: { imageBase64?: string; sourceObjectKey?: string; size?: string }) => {
  return request<FaceEnhanceResp>({
    url: '/api/zjz/face/enhance',
    method: 'POST',
    data: payload
  })
}

const getAIPhotoTemplates = () => {
  return request<any>({
    url: '/api/zjz/ai-photo/templates',
    method: 'POST'
  })
}

const makeAIPhoto = (payload: { templateId: string; images?: string[]; sourceObjectKeys?: string[]; noticeUrl?: string }) => {
  return request<AIPhotoMakeResp>({
    url: '/api/zjz/ai-photo/make',
    method: 'POST',
    data: payload
  })
}

const downloadFile = async (url: string) => {
  console.log('[api] download request', { url })
  const response = await Taro.downloadFile({ url })
  console.log('[api] download response', { url, statusCode: response.statusCode, tempFilePath: response.tempFilePath })
  return response
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
  payCallback,
  getMe,
  faceEnhance,
  getAIPhotoTemplates,
  makeAIPhoto,
  downloadFile
}
