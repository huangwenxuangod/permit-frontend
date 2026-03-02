import React, { useEffect, useState } from 'react'
import { View, Text, Camera } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec } from '../../services/api'
import './index.scss'

export default function CameraPage() {
  const [uploading, setUploading] = useState(false)

  const handleClose = () => {
    Taro.navigateBack()
  }

  const handleCapture = async () => {
    if (uploading) return
    setUploading(true)
    Taro.showLoading({ title: '上传中' })
    try {
      const mode = (Taro.getStorageSync('captureMode') as 'camera' | 'album') || 'camera'
      const chooseResult = await Taro.chooseImage({
        count: 1,
        sourceType: [mode]
      })
      const filePath = chooseResult.tempFilePaths[0]
      const objectKey = await api.uploadFile(filePath)
      let spec = Taro.getStorageSync('selectedSpec') as Spec | undefined
      if (!spec?.code) {
        const specs = await api.getSpecs()
        spec = specs[0]
        if (spec) {
          Taro.setStorageSync('selectedSpec', spec)
        }
      }
      const colors = spec?.bgColors?.length ? spec.bgColors : ['white']
      const task = await api.createTask({
        specCode: spec?.code,
        itemId: spec?.itemId,
        sourceObjectKey: objectKey,
        defaultBackground: colors[0],
        availableColors: colors,
        colors,
        widthPx: spec?.widthPx,
        heightPx: spec?.heightPx,
        dpi: spec?.dpi,
        beauty: 0,
        enhance: 0,
        watermark: false
      })
      Taro.setStorageSync('taskId', task.id)
      Taro.setStorageSync('task', task)
      Taro.navigateTo({ url: '/pages/detection/index' })
    } catch (error) {
      Taro.showToast({ title: '上传失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setUploading(false)
    }
  }

  return (
    <View className='camera-page'>
      <Camera className='camera-preview' devicePosition='front' />
      <View className='camera-mask'>
        <View className='camera-frame' />
        <View className='camera-corners'>
          <View className='corner tl' />
          <View className='corner tr' />
          <View className='corner bl' />
          <View className='corner br' />
        </View>
      </View>
      <View className='camera-controls'>
        <Text className='camera-control ghost' onClick={handleClose}>关闭</Text>
        <View className='camera-shutter' onClick={handleCapture} />
        <Text className='camera-control ghost'>切换</Text>
      </View>
    </View>
  )
}
