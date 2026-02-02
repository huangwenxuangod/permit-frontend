import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState('single')
  const [bgColor, setBgColor] = useState('blue')
  const [imagePath, setImagePath] = useState<string>('')

  useEffect(() => {
    const p = Taro.getStorageSync('selectedImagePath')
    if (p) setImagePath(p as string)
  }, [])

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
        <View className={`preview-image bg-${bgColor}`}>
          {imagePath ? (
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
            <View className={`color-btn white ${bgColor === 'white' ? 'active' : ''}`} onClick={() => setBgColor('white')}>白</View>
            <View className={`color-btn blue ${bgColor === 'blue' ? 'active' : ''}`} onClick={() => setBgColor('blue')}>蓝</View>
            <View className={`color-btn red ${bgColor === 'red' ? 'active' : ''}`} onClick={() => setBgColor('red')}>红</View>
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
