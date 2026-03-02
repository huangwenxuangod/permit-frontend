import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec, Task } from '../../services/api'
import './index.scss'

const tools = ['背景', '换装', '美颜', '增强']
const colorMap: Record<string, string> = {
  white: '#ffffff',
  blue: '#bfdbfe',
  red: '#fecaca'
}

export default function Preview() {
  const [task, setTask] = useState<Task | null>(null)
  const [activeColor, setActiveColor] = useState('white')
  const [activeTab, setActiveTab] = useState<'single' | 'layout'>('single')
  const [photoUrl, setPhotoUrl] = useState('')
  const [layoutUrl, setLayoutUrl] = useState('')

  const handleNext = () => {
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  const availableColors = useMemo(() => {
    if (!task) return []
    if (task.availableColors?.length) return task.availableColors
    return task.processedUrls ? Object.keys(task.processedUrls) : []
  }, [task])

  useEffect(() => {
    const storedTask = Taro.getStorageSync('task') as Task | undefined
    const storedColor = Taro.getStorageSync('previewColor') as string | undefined
    if (storedTask?.id) {
      setTask(storedTask)
      const initialColor = storedColor || storedTask.availableColors?.[0] || 'white'
      setActiveColor(initialColor)
      setPhotoUrl(storedTask.processedUrls?.[initialColor] || storedTask.baselineUrl || '')
      return
    }
    const taskId = Taro.getStorageSync('taskId') as string | undefined
    if (!taskId) return
    api.getTask(taskId).then(result => {
      setTask(result)
      Taro.setStorageSync('task', result)
      const initialColor = storedColor || result.availableColors?.[0] || 'white'
      setActiveColor(initialColor)
      setPhotoUrl(result.processedUrls?.[initialColor] || result.baselineUrl || '')
    }).catch(() => {})
  }, [])

  const handleColorChange = async (color: string) => {
    if (!task) return
    setActiveColor(color)
    Taro.setStorageSync('previewColor', color)
    const existing = task.processedUrls?.[color]
    if (existing) {
      setPhotoUrl(existing)
      return
    }
    try {
      const result = await api.addBackground(task.id, color, task.spec?.dpi)
      const nextTask = {
        ...task,
        processedUrls: {
          ...(task.processedUrls || {}),
          [color]: result.url
        }
      }
      setTask(nextTask)
      setPhotoUrl(result.url)
      Taro.setStorageSync('task', nextTask)
    } catch (error) {
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
  }

  const ensureLayout = async (color: string) => {
    if (!task) return
    const spec = task.spec || (Taro.getStorageSync('selectedSpec') as Spec | undefined)
    if (!spec) return
    const existingLayout = task.layoutUrls?.[color]
    if (existingLayout) {
      setLayoutUrl(existingLayout)
      return
    }
    try {
      const result = await api.createLayout(task.id, {
        color,
        widthPx: spec.widthPx,
        heightPx: spec.heightPx,
        dpi: spec.dpi,
        kb: 200
      })
      const nextTask = {
        ...task,
        layoutUrls: {
          ...(task.layoutUrls || {}),
          [color]: result.url
        }
      }
      setTask(nextTask)
      setLayoutUrl(result.url)
      Taro.setStorageSync('task', nextTask)
    } catch (error) {
      Taro.showToast({ title: '排版生成失败，请重试', icon: 'none' })
    }
  }

  useEffect(() => {
    if (activeTab !== 'layout') return
    ensureLayout(activeColor)
  }, [activeTab, activeColor, task?.id])

  return (
    <View className='preview'>
      <View className='preview-header'>
        <Text className='preview-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='preview-title'>相片预览</Text>
        <View className='preview-space' />
      </View>

      <View className='preview-tabs'>
        <Text
          className={`preview-tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          单张照预览
        </Text>
        <Text
          className={`preview-tab ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          排版照预览
        </Text>
      </View>

      <View className='preview-photo'>
        {activeTab === 'layout' ? (
          layoutUrl ? (
            <Image className='preview-layout-image' src={layoutUrl} mode='aspectFit' />
          ) : (
            <View className='preview-layout-frame' />
          )
        ) : (
          photoUrl ? (
            <Image className='preview-image' src={photoUrl} mode='aspectFit' />
          ) : (
            <View className='preview-frame' />
          )
        )}
        <View className='preview-badge'>预览图</View>
      </View>

      <View className='preview-tools'>
        {tools.map(tool => (
          <View key={tool} className='preview-tool'>
            <View className='preview-tool-icon' />
            <Text className='preview-tool-text'>{tool}</Text>
          </View>
        ))}
      </View>

      <View className='preview-colors'>
        {availableColors.map(color => (
          <View
            key={color}
            className={`preview-color ${activeColor === color ? 'active' : ''}`}
            style={{ background: colorMap[color] || color }}
            onClick={() => handleColorChange(color)}
          >
            <Text className='preview-color-text'>{color}</Text>
          </View>
        ))}
      </View>

      <View className='preview-footer'>
        <View className='preview-next' onClick={handleNext}>下一步</View>
      </View>
    </View>
  )
}
