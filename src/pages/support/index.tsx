import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function SupportPage() {
  const handleCopy = (text: string) => {
    Taro.setClipboardData({ data: text })
    Taro.showToast({ title: '已复制', icon: 'success' })
  }

  return (
    <View className='support-page'>
      <View className='section-card'>
        <Text className='section-title'>联系客服</Text>
        <Text className='section-desc'>工作日 9:00-18:00 提供在线支持</Text>
        <View className='support-row'>
          <Text className='support-label'>客服微信</Text>
          <Button className='ghost-btn' onClick={() => handleCopy('客服微信ID')}>复制</Button>
        </View>
        <View className='support-row'>
          <Text className='support-label'>邮箱</Text>
          <Button className='ghost-btn' onClick={() => handleCopy('support@example.com')}>复制</Button>
        </View>
      </View>

      <View className='section-card'>
        <Text className='section-title'>问题反馈</Text>
        <Text className='section-desc'>建议描述问题场景与截图，便于快速定位</Text>
        <Button className='primary-btn' onClick={() => Taro.navigateTo({ url: '/pages/faq/index' })}>查看常见问题</Button>
      </View>
    </View>
  )
}
