import Taro from '@tarojs/taro'
import { login as apiLogin, me as apiMe } from './api'

let tokenCache: string | null = null
let userCache: any = null
let logging = false

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function getToken(): string | null {
  if (tokenCache) return tokenCache
  const t = Taro.getStorageSync(TOKEN_KEY) as string
  tokenCache = t || null
  return tokenCache
}

export function setToken(t: string) {
  tokenCache = t
  Taro.setStorageSync(TOKEN_KEY, t)
}

export function clearToken() {
  tokenCache = null
  Taro.removeStorageSync(TOKEN_KEY)
}

export function getUser(): any {
  if (userCache) return userCache
  const u = Taro.getStorageSync(USER_KEY)
  userCache = u || null
  return userCache
}

export function setUser(u: any) {
  userCache = u
  Taro.setStorageSync(USER_KEY, u)
}

export function clearUser() {
  userCache = null
  Taro.removeStorageSync(USER_KEY)
}

function getEnv(): string {
  return process.env.TARO_ENV || ''
}

async function getCode(): Promise<string> {
  const env = getEnv()
  if (env === 'weapp') {
    const res = await Taro.login()
    try {
      console.log('Taro.login result:', res)
    } catch {}
    return res.code || ''
  } else if (env === 'h5') {
    const qs = typeof window !== 'undefined' ? window.location.search : ''
    const m = qs && qs.match(/[?&]code=([^&]+)/)
    const codeFromUrl = m ? decodeURIComponent(m[1]) : ''
    try {
      console.log('H5 code from URL:', codeFromUrl)
    } catch {}
    return codeFromUrl
  }
  return ''
}

export async function quickLogin(): Promise<boolean> {
  if (logging) return false
  logging = true
  try {
    const code = await getCode()
    try {
      Taro.setStorageSync('lastLoginCode', code || '')
      Taro.setStorageSync('lastLoginProvider', getEnv())
      if (code) console.log('quickLogin code:', code)
    } catch {}
    if (!code) return false
    const data = await apiLogin(code)
    if (data && data.token) setToken(data.token)
    const u = await apiMe()
    if (u) setUser(u)
    return true
  } catch {
    clearToken()
    clearUser()
    return false
  } finally {
    logging = false
  }
}

// 取消手机号绑定能力：不再提供 bindPhone

export async function bootstrapAuth(): Promise<void> {
  const t = getToken()
  if (t) {
    try {
      const u = await apiMe()
      if (u) setUser(u)
    } catch {
      clearToken()
      clearUser()
    }
  }
}

export function initAuthInterceptors(): void {
  const whitelist = [
    { path: '/api/login', method: 'POST' }
  ]
  const createRequestId = () => `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  Taro.addInterceptor(chain => {
    const req: any = chain.requestParams || {}
    const url: string = req.url || ''
    const method: string = (req.method || 'GET').toUpperCase()
    const startTime = Date.now()
    let pathname = ''
    try {
      pathname = new URL(url).pathname
    } catch {
      pathname = url
    }
    const isWhite =
      whitelist.some(i => pathname === i.path && method === i.method) ||
      pathname.startsWith('/assets')

    const headers = Object.assign({}, req.header || {})
    const requestId = headers['X-Request-Id'] || headers['x-request-id'] || createRequestId()
    headers['X-Request-Id'] = requestId
    if (!isWhite) {
      const t = getToken()
      if (t) headers['Authorization'] = `Bearer ${t}`
    }
    const nextReq = Object.assign({}, req, { header: headers })
    return chain.proceed(nextReq).then(async (res: any) => {
      const status = res.statusCode || res.status || 0
      const responseId = res?.header?.['X-Request-Id'] || res?.header?.['x-request-id'] || requestId
      const durationMs = Date.now() - startTime
      try {
        console.log('request trace:', { time: new Date().toISOString(), method, pathname, status, durationMs, requestId: responseId })
      } catch {}
      if (status === 401) {
        clearToken()
        clearUser()
      }
      return res
    })
  })
}
