import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { generateLayout } from '../../services/api'

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState('single')
  const [bgColor, setBgColor] = useState('blue')
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [imagePath, setImagePath] = useState<string>('')
  const [processedUrls, setProcessedUrls] = useState<Record<string, string>>({})
  const [baselineUrl, setBaselineUrl] = useState<string>('')
  const [layoutUrls, setLayoutUrls] = useState<Record<string, string>>({})
  const [beautyOn, setBeautyOn] = useState(false)
  const [enhanceOn, setEnhanceOn] = useState(false)
  const [outfitStyle, setOutfitStyle] = useState('')
  const [watermarkOn, setWatermarkOn] = useState(false)
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
    const specDetail = Taro.getStorageSync('selectedSpecDetail') as any
    const storedColors = Array.isArray(specDetail?.availableColors) ? specDetail.availableColors : []
    const fromStorage = (Taro.getStorageSync('previewColor') as string) || (Taro.getStorageSync('selectedBackground') as string)
    if (storedColors.length > 0) setAvailableColors(storedColors)
    else if (urls && typeof urls === 'object') {
      const keys = Object.keys(urls as Record<string, string>)
      if (keys.length > 0) setAvailableColors(keys)
    }
    if (fromStorage) setBgColor(fromStorage)
    setWatermarkOn(!!Taro.getStorageSync('watermark'))
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
        const specDetail = (Taro.getStorageSync('selectedSpecDetail') as any) || {}
        const spec = {
          widthPx: Number(specDetail?.widthPx || 295) || 295,
          heightPx: Number(specDetail?.heightPx || 413) || 413,
          dpi: Number(specDetail?.dpi || 300) || 300
        }
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

  const handleToggleBeauty = () => {
    const next = !beautyOn
    setBeautyOn(next)
    Taro.setStorageSync('beauty', next ? 1 : 0)
    Taro.showToast({ title: '设置已保存，将在重新生成时生效', icon: 'none' })
  }

  const handleToggleEnhance = () => {
    const next = !enhanceOn
    setEnhanceOn(next)
    Taro.setStorageSync('enhance', next ? 1 : 0)
    Taro.showToast({ title: '设置已保存，将在重新生成时生效', icon: 'none' })
  }

  const handleOutfit = async () => {
    setOutfitStyle('')
    Taro.showToast({ title: '换装服务即将上线', icon: 'none' })
  }

  const colors = availableColors.length > 0 ? availableColors : ['white', 'blue', 'red']

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
            {colors.map((color) => (
              <View
                key={color}
                className={`color-btn ${color} ${bgColor === color ? 'active' : ''}`}
                onClick={() => {
                  setBgColor(color)
                  Taro.setStorageSync('previewColor', color)
                }}
              >
                {color === 'white' ? '白' : color === 'blue' ? '蓝' : color === 'red' ? '红' : color}
              </View>
            ))}
          </View>
        </View>
        
        <View className='tool-row'>
          <Text className='tool-label'>工具：</Text>
          <View className='tool-btns'>
            <View className={`tool-btn ${outfitStyle ? 'active' : ''}`} onClick={handleOutfit}>
              {outfitStyle ? `换装·${outfitStyle}` : '换装'}
            </View>
            <View className={`tool-btn ${beautyOn ? 'active' : ''}`} onClick={handleToggleBeauty}>美颜</View>
            <View className={`tool-btn ${enhanceOn ? 'active' : ''}`} onClick={handleToggleEnhance}>增强</View>
            <View
              className={`tool-btn ${watermarkOn ? 'active' : ''}`}
              onClick={() => {
                const next = !watermarkOn
                setWatermarkOn(next)
                Taro.setStorageSync('watermark', next)
                Taro.showToast({ title: '设置已保存，将在重新生成时生效', icon: 'none' })
              }}
            >
              水印
            </View>
          </View>
        </View>
      </View>

      <View className='footer'>
        <Button className='btn-primary' onClick={handleNext}>下一步</Button>
      </View>
    </View>
  )
}
