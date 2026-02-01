import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function DetectionPage() {
  const [progress, setProgress] = useState(0)
  const [items, setItems] = useState([
    { text: '人像取景范围/头肩姿势符合标准', status: 'pending' },
    { text: '光线、色彩、清晰度', status: 'pending' },
    { text: '表情与着装符合证件要求', status: 'pending' },
    { text: '优化照片画质', status: 'pending' },
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          // Navigate to preview after short delay
          setTimeout(() => {
             Taro.navigateTo({ url: '/pages/preview/index' })
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 100) // 5 seconds total roughly

    // Simulate checklist updates
    setTimeout(() => updateItemStatus(0, 'success'), 1000)
    setTimeout(() => updateItemStatus(1, 'success'), 2500)
    setTimeout(() => updateItemStatus(2, 'success'), 3500)
    setTimeout(() => updateItemStatus(3, 'processing'), 4000)

    return () => clearInterval(timer)
  }, [])

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
            <Text className={`check-icon ${item.status}`}>
              {item.status === 'success' ? '✓' : item.status === 'processing' ? '⟳' : '○'}
            </Text>
            <Text className='check-text'>{item.text}</Text>
          </View>
        ))}
      </View>

      <View className='action-buttons'>
        <Button className='btn-secondary' onClick={() => Taro.navigateBack()}>取消</Button>
      </View>
    </View>
  )
}
