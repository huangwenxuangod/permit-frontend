import React from 'react'
import { View, Text, Switch, Button } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function SettingsPage() {
  const [autoSave, setAutoSave] = useState(true)
  const [wifiOnly, setWifiOnly] = useState(false)

  useEffect(() => {
    const saved = Taro.getStorageSync('settings') as any
    if (saved) {
      setAutoSave(!!saved.autoSave)
      setWifiOnly(!!saved.wifiOnly)
    }
  }, [])

  useEffect(() => {
    Taro.setStorageSync('settings', { autoSave, wifiOnly })
  }, [autoSave, wifiOnly])

  const handleClearCache = () => {
    Taro.showModal({
      title: '清理缓存',
      content: '会清除本地缓存与预览记录，是否继续？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync()
          Taro.showToast({ title: '已清理', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className='settings-page'>
      <View className='section-card'>
        <Text className='section-title'>下载与保存</Text>
        <View className='setting-item'>
          <Text className='setting-label'>自动保存到相册</Text>
          <Switch checked={autoSave} onChange={(e) => setAutoSave(e.detail.value)} color='#3B82F6' />
        </View>
        <View className='setting-item'>
          <Text className='setting-label'>仅 Wi-Fi 下载</Text>
          <Switch checked={wifiOnly} onChange={(e) => setWifiOnly(e.detail.value)} color='#3B82F6' />
        </View>
      </View>

      <View className='section-card'>
        <Text className='section-title'>存储</Text>
        <Button className='danger-btn' onClick={handleClearCache}>清理缓存</Button>
      </View>

      <View className='section-card'>
        <Text className='section-title'>关于</Text>
        <View className='info-row'>
          <Text className='info-label'>当前版本</Text>
          <Text className='info-value'>V1.0.0</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>协议与隐私</Text>
          <Text className='info-value'>请在官网查看</Text>
        </View>
      </View>
    </View>
  )
}
