import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'
import { getUser, setUser as setUserStorage } from '../../services/auth'
import { me } from '../../services/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [meta, setMeta] = useState({
    taskId: '',
    orderId: '',
    finalColor: '',
    lastLoginProvider: ''
  })

  useEffect(() => {
    const cached = getUser()
    if (cached) {
      setUser(cached)
      return
    }
    const run = async () => {
      try {
        const u = await me()
        if (u) {
          setUserStorage(u)
          setUser(u)
        }
      } catch {}
    }
    run()
  }, [])

  const readMeta = () => {
    const taskId = (Taro.getStorageSync('taskId') as string) || ''
    const orderId = (Taro.getStorageSync('orderId') as string) || ''
    const finalColor = (Taro.getStorageSync('finalColor') as string) || ''
    const lastLoginProvider = (Taro.getStorageSync('lastLoginProvider') as string) || ''
    setMeta({ taskId, orderId, finalColor, lastLoginProvider })
  }

  useEffect(() => {
    readMeta()
  }, [])

  Taro.useDidShow(() => {
    readMeta()
  })

  const menuItemsSafe = [
    { name: '拍照记录', action: 'orders' },
    { name: '设置', action: 'settings' },
    { name: '分享给好友', action: 'share' },
    { name: '常见问题', action: 'faq' }
  ]

  const displayName = useMemo(() => {
    const name = user?.nickname || user?.name || user?.username || ''
    return name || '未设置昵称'
  }, [user])
  const displayId = useMemo(() => {
    const id = user?.id || user?.userId || user?.uid || ''
    return id ? `ID：${id}` : 'ID：--'
  }, [user])
  const avatarUrl = useMemo(() => {
    return user?.avatarUrl || user?.avatar || user?.avatar_url || ''
  }, [user])

  const providerName = useMemo(() => {
    if (meta.lastLoginProvider === 'weapp') return '微信小程序'
    if (meta.lastLoginProvider === 'h5') return 'H5'
    if (meta.lastLoginProvider === 'tt') return '抖音'
    if (meta.lastLoginProvider === 'alipay') return '支付宝'
    return meta.lastLoginProvider || '--'
  }, [meta.lastLoginProvider])

  const colorLabel = (color: string) => {
    if (color === 'white') return '白底'
    if (color === 'blue') return '蓝底'
    if (color === 'red') return '红底'
    return color || '--'
  }

  const handleMenuClick = (item: { action: string }) => {
    if (item.action === 'orders') {
      Taro.switchTab({ url: '/pages/orders/index' })
      return
    }
    if (item.action === 'share') {
      Taro.showToast({ title: '请使用右上角分享', icon: 'none' })
      return
    }
    if (item.action === 'faq') {
      Taro.showToast({ title: '常见问题整理中', icon: 'none' })
      return
    }
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  const handleCustomerService = () => {
    Taro.showToast({ title: '客服暂未接入', icon: 'none' })
  }

  const handleShortcut = (action: string) => {
    if (action === 'camera') {
      Taro.switchTab({ url: '/pages/index/index' })
      return
    }
    if (action === 'specs') {
      Taro.navigateTo({ url: '/pages/specs/index' })
      return
    }
    if (action === 'orders') {
      Taro.switchTab({ url: '/pages/orders/index' })
      return
    }
    if (action === 'pay') {
      Taro.showToast({ title: '请在订单内完成支付', icon: 'none' })
      return
    }
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  return (
    <View className='profile-page'>
      <View className='user-card'>
        {avatarUrl ? (
          <Image className='avatar' src={avatarUrl} mode='aspectFill' />
        ) : (
          <View className='avatar'></View>
        )}
        <View className='user-info'>
          <Text className='nickname'>{displayName}</Text>
          <Text className='user-id'>{displayId}</Text>
        </View>
      </View>

      <View className='stats-card'>
        <View className='stat-item'>
          <Text className='stat-value'>{meta.taskId ? '进行中' : '--'}</Text>
          <Text className='stat-label'>任务</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{meta.orderId ? '已生成' : '--'}</Text>
          <Text className='stat-label'>订单</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{colorLabel(meta.finalColor)}</Text>
          <Text className='stat-label'>成品底色</Text>
        </View>
      </View>

      <View className='section-card'>
        <Text className='section-title'>常用入口</Text>
        <View className='shortcut-grid'>
          <View className='shortcut-item' onClick={() => handleShortcut('camera')}>
            <Image className='shortcut-icon' src={icons.camera} />
            <Text className='shortcut-text'>去拍照</Text>
          </View>
          <View className='shortcut-item' onClick={() => handleShortcut('specs')}>
            <Image className='shortcut-icon' src={icons.picture} />
            <Text className='shortcut-text'>选规格</Text>
          </View>
          <View className='shortcut-item' onClick={() => handleShortcut('orders')}>
            <Image className='shortcut-icon' src={icons.orders} />
            <Text className='shortcut-text'>看订单</Text>
          </View>
          <View className='shortcut-item' onClick={() => handleShortcut('pay')}>
            <Image className='shortcut-icon' src={icons.creditCard} />
            <Text className='shortcut-text'>去支付</Text>
          </View>
        </View>
      </View>

      <View className='menu-list'>
        {menuItemsSafe.map((item, index) => (
          <View key={index} className='menu-item' onClick={() => handleMenuClick(item)}>
            <Text className='menu-name'>{item.name}</Text>
            <Image src={icons.arrowDown} style={{ width: '16px', height: '16px' }} />
          </View>
        ))}
      </View>

      <View className='floating-cs' onClick={handleCustomerService}>
        <Image src={icons.customerService} style={{ width: '20px', height: '20px' }} />
      </View>
    </View>
  )
}
