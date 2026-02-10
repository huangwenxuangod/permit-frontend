import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro, { useDidHide, useUnload } from '@tarojs/taro'
import './index.scss'
import { uploadImage, createTask, getTask } from '../../services/api'

export default function DetectionPage() {
  const [previewImage, setPreviewImage] = useState('')
  const [statusText, setStatusText] = useState('正在上传并生成证件照')
  const canceledRef = useRef(false)
  const timerRef = useRef<any>(null)
  const handleFailure = (message: string, error?: unknown) => {
    if (canceledRef.current) return
    if (error) {
      console.log('failure:', message, error)
    }
    Taro.showToast({ title: message, icon: 'none' })
    setTimeout(() => {
      if (!canceledRef.current) {
        Taro.navigateBack()
      }
    }, 800)
  }

  useEffect(() => {
    const run = async () => {
      try {
        const imagePath = Taro.getStorageSync('selectedImagePath') as string
        if (!imagePath) {
          Taro.showToast({ title: '请先选择图片', icon: 'none' })
          return
        }
        setPreviewImage(imagePath)
        if (canceledRef.current) return
        setStatusText('正在上传照片')
        const objectKey = await uploadImage(imagePath)
        if (canceledRef.current) return
        setStatusText('正在生成证件照')
        const specCode = (Taro.getStorageSync('selectedSpecCode') as string) || 'default'
        const widthPx = 295
        const heightPx = 413
        const dpi = 300
        const task = await createTask({ specCode, sourceObjectKey: objectKey, widthPx, heightPx, dpi, defaultBackground: 'white' })
        if (!task || task.status === 'failed') {
          handleFailure('生成失败，请重新选择照片', { task, phase: 'createTask', errorMsg: task?.errorMsg })
          return
        }
        let taskId = task.id as string
        let baselineUrl = task.baselineUrl as string
        let processedUrls = task.processedUrls as Record<string, string> || {}
        if (!baselineUrl || !processedUrls || task.status !== 'done') {
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 1000))
            if (canceledRef.current) break
            const info = await getTask(taskId)
            if (info.status === 'failed') {
              handleFailure('生成失败，请重新选择照片', { info, phase: 'getTask', errorMsg: info?.errorMsg })
              return
            }
            if (info.status === 'done') {
              baselineUrl = info.baselineUrl
              processedUrls = info.processedUrls || {}
              break
            }
          }
        }
        if (!baselineUrl || !processedUrls || Object.keys(processedUrls || {}).length === 0) {
          handleFailure('生成失败，请重新选择照片', { baselineUrl, processedUrls, phase: 'validateResult' })
          return
        }
        if (!canceledRef.current) {
          Taro.setStorageSync('taskId', taskId)
          if (baselineUrl) Taro.setStorageSync('baselineUrl', baselineUrl)
          if (processedUrls) Taro.setStorageSync('processedUrls', processedUrls)
          setStatusText('生成成功，正在跳转')
          setTimeout(() => {
            if (!canceledRef.current) {
              Taro.navigateTo({ url: '/pages/preview/index' })
            }
          }, 600)
        }
      } catch (e) {
        handleFailure('处理失败，请重新选择照片', e)
      }
    }
    run()
    return () => {
      canceledRef.current = true
      timerRef.current = null
    }
  }, [])

  useDidHide(() => {
    canceledRef.current = true
    timerRef.current = null
  })
  useUnload(() => {
    canceledRef.current = true
    timerRef.current = null
  })

  return (
    <View className='detection-page'>
      <Text className='status-title'>{statusText}</Text>
      <Text className='status-sub'>请保持不动，正在扫描并优化照片</Text>

      <View className='scan-card'>
        <Image className='scan-image' src={previewImage} mode='aspectFill' />
        <View className='scan-overlay'>
          <View className='scan-line' />
          <View className='scan-glow' />
        </View>
      </View>

      <View className='loading-row'>
        <View className='loading-dot dot-1' />
        <View className='loading-dot dot-2' />
        <View className='loading-dot dot-3' />
      </View>
    </View>
  )
}
