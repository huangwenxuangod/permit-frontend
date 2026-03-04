import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec, Task } from '../../services/api'
import { icons } from '../../assets/icons'
import './index.scss'

const tools = ['背景', '换装', '美颜', '增强']
const palette = ['red', 'blue', 'white']
const colorMap: Record<string, string> = {
  white: '#ffffff',
  blue: '#0b3d91',
  red: '#c1121f'
}

export default function Preview() {
  const [task, setTask] = useState<Task | null>(null)
  const [activeColor, setActiveColor] = useState('white')
  const [activeTab, setActiveTab] = useState<'single' | 'layout'>('single')
  const [photoUrl, setPhotoUrl] = useState('')
  const [layoutUrl, setLayoutUrl] = useState('')
  const [toolLoading, setToolLoading] = useState('')

  const handleNext = () => {
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  const getPalette = (source?: Task | null) => {
    if (!source) return palette
    const available = source.availableColors?.length ? source.availableColors : (source.processedUrls ? Object.keys(source.processedUrls) : [])
    const matched = palette.filter(color => available.includes(color))
    return matched.length ? matched : palette
  }

  const paletteColors = useMemo(() => getPalette(task), [task])

  useEffect(() => {
    const storedTask = Taro.getStorageSync('task') as Task | undefined
    const storedColor = Taro.getStorageSync('previewColor') as string | undefined
    if (storedTask?.id) {
      const paletteList = getPalette(storedTask)
      const initialColor = storedColor && paletteList.includes(storedColor) ? storedColor : (paletteList[0] || 'red')
      setTask(storedTask)
      setActiveColor(initialColor)
      setPhotoUrl(storedTask.processedUrls?.[initialColor] || storedTask.baselineUrl || '')
      return
    }
    const taskId = Taro.getStorageSync('taskId') as string | undefined
    if (!taskId) return
    api.getTask(taskId).then(result => {
      const paletteList = getPalette(result)
      const initialColor = storedColor && paletteList.includes(storedColor) ? storedColor : (paletteList[0] || 'red')
      setTask(result)
      Taro.setStorageSync('task', result)
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

  const updatePhoto = (image: string) => {
    if (!image) return
    const normalized = image.startsWith('http') || image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
    setPhotoUrl(normalized)
    const nextTask = {
      ...task,
      baselineUrl: normalized
    }
    setTask(nextTask)
    Taro.setStorageSync('task', nextTask)
  }

  const handleToolClick = async (tool: string) => {
    if (!task?.id) return
    if (toolLoading) return
    if (tool === '背景') {
      Taro.showToast({ title: '请选择下方背景色', icon: 'none' })
      return
    }
    if (!task.sourceObjectKey) {
      Taro.showToast({ title: '缺少源图，请重新拍摄', icon: 'none' })
      return
    }
    try {
      setToolLoading(tool)
      Taro.showLoading({ title: '处理中' })
      if (tool === '增强' || tool === '美颜') {
        const result = await api.faceEnhance({
          sourceObjectKey: task.sourceObjectKey,
          size: tool === '美颜' ? '768' : '1024'
        })
        if (result?.data?.image) {
          updatePhoto(result.data.image)
          Taro.showToast({ title: '已更新预览', icon: 'success' })
        } else {
          Taro.showToast({ title: '处理完成', icon: 'success' })
        }
        return
      }
      if (tool === '换装') {
        const templates = await api.getAIPhotoTemplates()
        const template = Array.isArray(templates) ? templates[0] : (templates?.list?.[0] || templates?.data?.[0])
        const templateId = template?.id || template?.templateId
        if (!templateId) {
          Taro.showToast({ title: '暂无可用模板', icon: 'none' })
          return
        }
        await api.makeAIPhoto({
          templateId,
          sourceObjectKeys: [task.sourceObjectKey]
        })
        Taro.showToast({ title: '已发起换装处理', icon: 'success' })
      }
    } catch (error) {
      Taro.showToast({ title: '处理失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setToolLoading('')
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
        <View className='preview-back' onClick={() => Taro.navigateBack()}>
          <Image className='preview-back-icon' src={icons.arrowLeft} />
        </View>
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
          <View key={tool} className='preview-tool' onClick={() => handleToolClick(tool)}>
            <View className='preview-tool-icon' />
            <Text className='preview-tool-text'>{tool}</Text>
          </View>
        ))}
      </View>

      <View className='preview-colors'>
        {paletteColors.map(color => (
          <View
            key={color}
            className={`preview-color ${activeColor === color ? 'active' : ''}`}
            style={{ background: colorMap[color] || color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </View>

      <View className='preview-footer'>
        <View className='preview-next' onClick={handleNext}>下一步</View>
      </View>
    </View>
  )
}
