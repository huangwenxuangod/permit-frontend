import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

export default function CameraGuidePage() {
  const router = useRouter()
  const { spec } = router.params
  const specName = spec || '证件照'

  const handleChooseImage = () => {
    // Navigate to detection
    Taro.navigateTo({ url: '/pages/detection/index' })
  }

  const handleTakePhoto = () => {
    // Navigate to detection
    Taro.navigateTo({ url: '/pages/detection/index' })
  }

  return (
    <View className='camera-guide-page'>
      <View className='header'>
        <Text className='spec-name'>{specName}</Text>
        <Text className='spec-tag'>认证回执</Text>
      </View>

      <View className='guide-content'>
        <View className='guide-item'>
          <Text className='guide-num'>1</Text>
          <Text className='guide-text'>纯色背景与均匀光线</Text>
        </View>
        <View className='guide-item'>
          <Text className='guide-num'>2</Text>
          <Text className='guide-text'>正对镜头头不倾斜</Text>
        </View>
        <View className='guide-item'>
          <Text className='guide-num'>3</Text>
          <Text className='guide-text'>避免反光</Text>
        </View>

        <View className='illustration-area'>
          <Text className='illustration-placeholder'>示意图区域：三点说明配图</Text>
        </View>
      </View>

      <View className='spec-details'>
        <Text>冲印尺寸：33x48mm</Text>
        <Text>像素尺寸：390x567px</Text>
        <Text>分辨率：300DPI</Text>
      </View>

      <View className='action-buttons'>
        <Button className='btn-secondary' onClick={handleChooseImage}>相册选取</Button>
        <Button className='btn-primary' onClick={handleTakePhoto}>现在拍摄</Button>
      </View>
    </View>
  )
}
