import React, { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initAuthInterceptors, bootstrapAuth, quickLogin } from './services/auth'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(async () => {
    initAuthInterceptors()
    await quickLogin().catch(() => {})
    await bootstrapAuth()
  })

  // children 是将要会渲染的页面
  return children
}
  

void React

export default App
