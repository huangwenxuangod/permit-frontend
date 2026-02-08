import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro, { useDidHide, useUnload } from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'
import { uploadImage, createTask, getTask } from '../../services/api'

export default function DetectionPage() {
  const [progress, setProgress] = useState(0)
  const [items, setItems] = useState([
    { text: '人像取景范围/头肩姿势符合标准', status: 'pending' },
    { text: '光线、色彩、清晰度', status: 'pending' },
    { text: '表情与着装符合证件要求', status: 'pending' },
    { text: '优化照片画质', status: 'pending' },
  ])
  const canceledRef = useRef(false)
  const timerRef = useRef<any>(null)
  const handleFailure = (message: string, error?: unknown) => {
    if (canceledRef.current) return
    if (error) {
      console.log('failure:', message, error)
    }
    Taro.showToast({ title: message, icon: 'none' })
    updateItemStatus(3, 'pending')
    setTimeout(() => {
      if (!canceledRef.current) {
        Taro.navigateBack()
      }
    }, 800)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setProgress(prev => (canceledRef.current ? prev : (prev >= 100 ? 100 : prev + 2)))
    }, 100)
    const run = async () => {
      try {
        const imagePath = Taro.getStorageSync('selectedImagePath') as string
        if (!imagePath) {
          Taro.showToast({ title: '请先选择图片', icon: 'none' })
          return
        }
        if (canceledRef.current) return
        updateItemStatus(0, 'processing')
        const objectKey = await uploadImage(imagePath)
        if (canceledRef.current) return
        updateItemStatus(0, 'success')
        updateItemStatus(1, 'processing')
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
          updateItemStatus(2, 'processing')
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
          updateItemStatus(2, 'success')
          updateItemStatus(3, 'success')
          Taro.setStorageSync('taskId', taskId)
          if (baselineUrl) Taro.setStorageSync('baselineUrl', baselineUrl)
          if (processedUrls) Taro.setStorageSync('processedUrls', processedUrls)
        }
      } catch (e) {
        handleFailure('处理失败，请重新选择照片', e)
      }
    }
    run()
    return () => {
      canceledRef.current = true
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  useDidHide(() => {
    canceledRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  })
  useUnload(() => {
    canceledRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  })

  const updateItemStatus = (index, status) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index].status = status
      return newItems
    })
  }

  return (
    <View className='detection-page'>
      <Text className='status-text'>证件照生成中，预计耗时 ~ 5 秒</Text>
      
      <View className='progress-container'>
        <View className='progress-bar' style={{ width: `${progress}%` }}></View>
      </View>

      <View className='checklist'>
        {items.map((item, index) => (
          <View key={index} className='check-item'>
            <View className={`check-icon ${item.status}`}>
              <Image
                src={
                  item.status === 'success'
                    ? icons.success
                    : item.status === 'processing'
                    ? icons.loading
                    : icons.history
                }
                style={{ width: '16px', height: '16px' }}
              />
            </View>
            <Text className='check-text'>{item.text}</Text>
          </View>
        ))}
      </View>

      <View className='action-buttons'>
        <Button className='btn-secondary' onClick={() => Taro.navigateBack()}>取消</Button>
        <Button className='btn-primary' onClick={() => Taro.navigateTo({ url: '/pages/preview/index' })}>下一步</Button>
      </View>
    </View>
  )
}
