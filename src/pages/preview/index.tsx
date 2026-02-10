import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { generateLayout } from '../../services/api'

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState('single')
  const [bgColor, setBgColor] = useState('blue')
  const [imagePath, setImagePath] = useState<string>('')
  const [processedUrls, setProcessedUrls] = useState<Record<string, string>>({})
  const [baselineUrl, setBaselineUrl] = useState<string>('')
  const [layoutUrls, setLayoutUrls] = useState<Record<string, string>>({})
  const layoutLoadingRef = useRef(false)

  useEffect(() => {
    const p = Taro.getStorageSync('selectedImagePath')
    if (p) setImagePath(p as string)
    const urls = Taro.getStorageSync('processedUrls')
    if (urls) setProcessedUrls(urls as Record<string, string>)
    const b = Taro.getStorageSync('baselineUrl')
    if (b) setBaselineUrl(b as string)
    const l = Taro.getStorageSync('layoutUrls')
    if (l) setLayoutUrls(l as Record<string, string>)
  }, [])

  useEffect(() => {
    const run = async () => {
      if (activeTab !== 'layout') return
      if (layoutLoadingRef.current) return
      if (layoutUrls[bgColor]) return
      const taskId = Taro.getStorageSync('taskId') as string
      if (!taskId) return
      layoutLoadingRef.current = true
      try {
        const spec = { widthPx: 295, heightPx: 413, dpi: 300 }
        const res: any = await generateLayout(taskId, bgColor, spec.widthPx, spec.heightPx, spec.dpi, 200)
        const url = res?.url || res?.layoutUrl || res?.processedUrls?.[bgColor]
        if (url) {
          const next = { ...layoutUrls, [bgColor]: url }
          setLayoutUrls(next)
          Taro.setStorageSync('layoutUrls', next)
        }
      } finally {
        layoutLoadingRef.current = false
      }
    }
    run()
  }, [activeTab, bgColor, layoutUrls])

  const handleNext = () => {
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  return (
    <View className='preview-page'>
      <View className='tabs'>
        <View 
          className={`tab-item ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          单张照预览
        </View>
        <View 
          className={`tab-item ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          排版照预览
        </View>
      </View>

      <View className='preview-container'>
        <View className={`preview-image bg-${bgColor} ${activeTab === 'layout' ? 'is-layout' : ''}`}>
          {activeTab === 'layout' && layoutUrls[bgColor] ? (
            <Image src={layoutUrls[bgColor]} mode='aspectFit' style={{ width: '100%', height: '100%' }} />
          ) : processedUrls[bgColor] ? (
            <Image src={processedUrls[bgColor]} mode='aspectFit' style={{ width: '100%', height: '100%' }} />
          ) : baselineUrl ? (
            <Image src={baselineUrl} mode='aspectFit' style={{ width: '100%', height: '100%' }} />
          ) : imagePath ? (
            <Image src={imagePath} mode='aspectFit' style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text className='preview-placeholder'>预览图（{bgColor === 'blue' ? '蓝底' : bgColor === 'white' ? '白底' : '红底'}）</Text>
          )}
        </View>
      </View>

      <View className='tools-panel'>
        <View className='tool-row'>
          <Text className='tool-label'>背景：</Text>
          <View className='color-options'>
            <View className={`color-btn white ${bgColor === 'white' ? 'active' : ''}`} onClick={() => { setBgColor('white'); Taro.setStorageSync('previewColor', 'white') }}>白</View>
            <View className={`color-btn blue ${bgColor === 'blue' ? 'active' : ''}`} onClick={() => { setBgColor('blue'); Taro.setStorageSync('previewColor', 'blue') }}>蓝</View>
            <View className={`color-btn red ${bgColor === 'red' ? 'active' : ''}`} onClick={() => { setBgColor('red'); Taro.setStorageSync('previewColor', 'red') }}>红</View>
          </View>
        </View>
        
        <View className='tool-row'>
          <Text className='tool-label'>工具：</Text>
          <View className='tool-btns'>
            <View className='tool-btn'>换装</View>
            <View className='tool-btn'>美颜</View>
            <View className='tool-btn'>增强</View>
          </View>
        </View>
      </View>

      <View className='footer'>
        <Button className='btn-primary' onClick={handleNext}>下一步</Button>
      </View>
    </View>
  )
}
