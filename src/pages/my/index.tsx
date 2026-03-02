import React from '@tarojs/react'
import { useEffect,useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { icons } from '../../assets/icons'
import { api } from '../../services/api'
import './index.scss'

const menuItems = [
  { title: '拍照记录', icon: icons.history },
  { title: '设置', icon: icons.settings },
  { title: '分享给好友', icon: icons.share },
  { title: '常见问题', icon: icons.user }
]

export default function My() {
  const [nickname, setNickname] = useState('未设置昵称')
  const [userId, setUserId] = useState('--')
  const [avatar, setAvatar] = useState(icons.user)

  useEffect(() => {
    api.getMe().then(profile => {
      setNickname(profile.nickname || '未设置昵称')
      setUserId(profile.userId || '--')
      setAvatar(profile.avatar || icons.user)
    }).catch(() => {})
  }, [])

  return (
    <View className='my'>
      <View className='my-header'>
        <View className='my-avatar'>
          <Image className='my-avatar-img' src={avatar} />
        </View>
        <View className='my-user'>
          <Text className='my-name'>{nickname}</Text>
          <Text className='my-id'>ID: {userId}</Text>
        </View>
        <View className='my-edit'>
          <Image className='my-edit-icon' src={icons.edit} />
        </View>
      </View>

      <View className='my-card'>
        {menuItems.map(item => (
          <View key={item.title} className='my-item'>
            <View className='my-item-left'>
              <Image className='my-item-icon' src={item.icon} />
              <Text className='my-item-text'>{item.title}</Text>
            </View>
            <Image className='my-item-arrow' src={icons.arrowLeft} />
          </View>
        ))}
      </View>
    </View>
  )
}
