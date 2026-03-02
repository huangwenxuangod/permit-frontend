import React from '@tarojs/react'
import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function DetectResult() {
  const [errorMsg, setErrorMsg] = useState('检测未通过')

  const handleRetry = () => {
    Taro.navigateTo({ url: '/pages/camera/index' })
  }

  const handlePreview = () => {
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  useEffect(() => {
    const stored = Taro.getStorageSync('taskError') as string | undefined
    if (stored) {
      setErrorMsg(stored)
    }
  }, [])

  return (
    <View className='result'>
      <View className='result-header'>
        <Text className='result-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='result-title'>检测不通过</Text>
        <View className='result-space' />
      </View>

      <View className='result-card'>
        <View className='result-thumb' />
        <View className='result-info'>
          <Text className='result-info-title'>检测未通过</Text>
          <Text className='result-info-desc'>{errorMsg}</Text>
        </View>
      </View>

      <View className='result-tips'>
        <Text className='result-tips-title'>请仔细阅读后重新拍摄</Text>
        <View className='result-tip-list'>
          <Text>抬头挺胸，双眼平视前方</Text>
          <Text>面部明亮，无明显阴影</Text>
          <Text>完整露出耳朵、眉毛</Text>
          <Text>不要佩戴粗框眼镜</Text>
        </View>
      </View>

      <View className='result-actions'>
        <View className='result-btn ghost' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>回到首页</View>
        <View className='result-btn primary' onClick={handleRetry}>重新拍摄</View>
      </View>

      <View className='result-preview' onClick={handlePreview}>
        <Text className='result-preview-text'>继续预览</Text>
      </View>
    </View>
  )
}
