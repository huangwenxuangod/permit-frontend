import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { icons } from '../../assets/icons'

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
            <Image src={icons.arrowDown} style={{ width: '16px', height: '16px' }} />
          </View>
        ))}
      </View>

      <View className='floating-cs'>
        <Image src={icons.user} style={{ width: '20px', height: '20px' }} />
      </View>
    </View>
  )
}
