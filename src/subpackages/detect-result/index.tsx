import React, { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { icons } from '../../assets/icons'
import './index.scss'

export default function DetectResult() {
  const [errorMsg, setErrorMsg] = useState('检测未通过')

  const handleRetry = () => {
    Taro.navigateTo({ url: '/subpackages/camera/index' })
  }

  const handlePreview = () => {
    Taro.navigateTo({ url: '/subpackages/preview/index' })
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
        <View className='result-back' onClick={() => Taro.navigateBack()}>
          <Image className='result-back-icon' src={icons.arrowLeft} />
        </View>
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

      <View className='result-section'>
        <Text className='result-section-title'>重新拍摄要点</Text>
        <View className='result-tip-list'>
          <View className='result-tip-item'>
            <View className='result-tip-index'>1</View>
            <Text className='result-tip-text'>抬头挺胸，双眼平视前方</Text>
          </View>
          <View className='result-tip-item'>
            <View className='result-tip-index'>2</View>
            <Text className='result-tip-text'>面部明亮，无明显阴影</Text>
          </View>
          <View className='result-tip-item'>
            <View className='result-tip-index'>3</View>
            <Text className='result-tip-text'>完整露出耳朵、眉毛</Text>
          </View>
          <View className='result-tip-item'>
            <View className='result-tip-index'>4</View>
            <Text className='result-tip-text'>不要佩戴粗框眼镜</Text>
          </View>
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
