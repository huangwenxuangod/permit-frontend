import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default function ProfilePage() {
  const menuItemsSafe = [
    { name: '拍照记录' },
    { name: '设置' },
    { name: '分享给好友' },
    { name: '常见问题' },
  ]

  return (
    <View className='profile-page'>
      <View className='user-card'>
        <View className='avatar'></View>
        <View className='user-info'>
          <Text className='nickname'>未设置昵称 ✎</Text>
          <Text className='user-id'>ID：1764471719</Text>
        </View>
      </View>

      <View className='menu-list'>
        {menuItemsSafe.map((item, index) => (
          <View key={index} className='menu-item'>
            <Text className='menu-name'>{item.name}</Text>
            <Text className='menu-arrow'>&gt;</Text>
          </View>
        ))}
      </View>

      <View className='floating-cs'>
        <Text>服</Text>
      </View>
    </View>
  )
}
