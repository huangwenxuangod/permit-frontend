import { PropsWithChildren, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { api } from './services/api'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useEffect(() => {
    const token = Taro.getStorageSync('token')
    if (token) return
    Taro.login({
      success: async (result) => {
        if (!result.code) return
        try {
          const data = await api.login(result.code)
          Taro.setStorageSync('token', data.token)
          Taro.setStorageSync('userId', data.userId)
          Taro.setStorageSync('openid', data.openid)
        } catch (error) {
          Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
        }
      }
    })
  }, [])
  return children
}
export default App
