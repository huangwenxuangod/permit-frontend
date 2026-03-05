import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import { images } from '../../assets/images'
import { icons } from '../../assets/icons'
import { api, Spec } from '../../services/api'
import './index.scss'

export default function CameraGuide() {
  const [spec, setSpec] = useState<Spec | null>(null)

  const handlePick = (mode: 'album' | 'camera') => {
    Taro.setStorageSync('captureMode', mode)
    Taro.navigateTo({ url: '/subpackages/camera/index' })
  }

  useEffect(() => {
    const stored = Taro.getStorageSync('selectedSpec') as Spec | undefined
    if (stored?.code) {
      setSpec(stored)
      return
    }
    console.log('[page:camera-guide] loadSpecs')
    api.getSpecs().then(list => {
      if (list.length > 0) {
        const nextSpec = stored?.code ? list.find(item => item.code === stored.code) : list[0]
        const selected = nextSpec || list[0]
        setSpec(selected)
        Taro.setStorageSync('selectedSpec', selected)
      }
    }).catch(() => setSpec(null))
  }, [])

  return (
    <View className='guide'>
      <View className='guide-header'>
        <View className='guide-back' onClick={() => Taro.navigateBack()}>
          <Image className='guide-back-icon' src={icons.arrowLeft} />
        </View>
        <Text className='guide-title'>拍摄指引</Text>
        <View className='guide-space' />
      </View>

      <Text className='guide-spec'>{spec ? spec.name : '加载规格中'}</Text>

      <View className='guide-hero'>
        <Image className='guide-hero-image' src={images.guideIllustration} mode='aspectFit' />
      </View>

      <View className='guide-tips'>
        <Text>1. 选择纯色背景</Text>
        <Text>2. 正对镜头，头部不歪斜</Text>
        <Text>3. 确保脸部无阴影</Text>
      </View>

      <View className='guide-metrics'>
        <View className='guide-metric'>
          <Text className='guide-metric-label'>像素尺寸</Text>
          <Text className='guide-metric-value'>{spec ? `${spec.widthPx}x${spec.heightPx}px` : '-'}</Text>
        </View>
        <View className='guide-metric'>
          <Text className='guide-metric-label'>分辨率</Text>
          <Text className='guide-metric-value'>{spec ? `${spec.dpi}` : '-'}</Text>
        </View>
      </View>

      <View className='guide-actions'>
        <View className='guide-btn ghost' onClick={() => handlePick('album')}>相册选取</View>
        <View className='guide-btn primary' onClick={() => handlePick('camera')}>现在拍摄</View>
      </View>
    </View>
  )
}
