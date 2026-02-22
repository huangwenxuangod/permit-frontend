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
  const [beautyOn, setBeautyOn] = useState(false)
  const [enhanceOn, setEnhanceOn] = useState(false)
  const [outfitStyle, setOutfitStyle] = useState('')
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

  const handleToggleBeauty = () => {
    const next = !beautyOn
    setBeautyOn(next)
    Taro.showToast({ title: next ? '美颜已开启（预览）' : '美颜已关闭', icon: 'none' })
  }

  const handleToggleEnhance = () => {
    const next = !enhanceOn
    setEnhanceOn(next)
    Taro.showToast({ title: next ? '增强已开启（预览）' : '增强已关闭', icon: 'none' })
  }

  const handleOutfit = async () => {
    try {
      const res = await Taro.showActionSheet({ itemList: ['证件正装', '职业装', '不更换'] })
      const map = ['证件正装', '职业装', '不更换']
      const selected = map[res.tapIndex]
      if (selected === '不更换') {
        setOutfitStyle('')
        Taro.showToast({ title: '已恢复原始穿着', icon: 'none' })
        return
      }
      setOutfitStyle(selected)
      Taro.showToast({ title: `已选择${selected}（预览）`, icon: 'none' })
    } catch {}
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
            <View className={`tool-btn ${outfitStyle ? 'active' : ''}`} onClick={handleOutfit}>
              {outfitStyle ? `换装·${outfitStyle}` : '换装'}
            </View>
            <View className={`tool-btn ${beautyOn ? 'active' : ''}`} onClick={handleToggleBeauty}>美颜</View>
            <View className={`tool-btn ${enhanceOn ? 'active' : ''}`} onClick={handleToggleEnhance}>增强</View>
          </View>
        </View>
      </View>

      <View className='footer'>
        <Button className='btn-primary' onClick={handleNext}>下一步</Button>
      </View>
    </View>
  )
}
