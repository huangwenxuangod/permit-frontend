import React from '@tarojs/react'
import { useMemo, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { icons } from '../../assets/icons'
import { images } from '../../assets/images'
import { api, Spec } from '../../services/api'
import './index.scss'

const quickActions = [
  { title: '制作证件照', subtitle: '多类型规格', icon: icons.camera, path: '/pages/search/index' },
  { title: '修复老照片', subtitle: '智能修复', icon: icons.edit, path: '/pages/search/index' },
  { title: '回执专区', subtitle: '快速办理', icon: icons.creditCard, path: '/pages/search/index' }
]

const featureActions = [
  { title: '智能清晰', icon: icons.picture },
  { title: '换底色', icon: icons.editFile },
  { title: '改大小', icon: icons.edit }
]

export default function Index() {
  const [specs, setSpecs] = useState<Spec[]>([])
  const loadSpecs = () => {
    api.getSpecs().then(setSpecs).catch(() => setSpecs([]))
  }

  const handleToSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleSpecSelect = (spec: Spec) => {
    Taro.setStorageSync('selectedSpec', spec)
    Taro.navigateTo({ url: '/pages/camera-guide/index' })
  }

  useDidShow(() => {
    loadSpecs()
  })

  const hotSpecs = useMemo(() => specs.slice(0, 6), [specs])

  return (
    <View className='home'>
      <View className='home-hero'>
        <View className='home-hero-text'>
          <Text className='home-title'>官方机构认可</Text>
          <Text className='home-subtitle'>专业回执办理</Text>
        </View>
        <Image className='home-hero-image' src={images.guideIllustration} mode='aspectFill' />
      </View>

      <View className='home-actions'>
        {quickActions.map(action => (
          <View key={action.title} className='home-action-card' onClick={handleToSearch}>
            <Image className='home-action-icon' src={action.icon} />
            <View className='home-action-text'>
              <Text className='home-action-title'>{action.title}</Text>
              <Text className='home-action-subtitle'>{action.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='home-feature-grid'>
        {featureActions.map(action => (
          <View key={action.title} className='home-feature-item'>
            <Image className='home-feature-icon' src={action.icon} />
            <Text className='home-feature-text'>{action.title}</Text>
          </View>
        ))}
      </View>

      <View className='home-section'>
        <View className='home-section-header'>
          <Text className='home-section-title'>热门证照规格</Text>
          <Text className='home-section-more' onClick={handleToSearch}>更多规格</Text>
        </View>
        <View className='home-spec-grid'>
          {hotSpecs.map(spec => (
            <View key={spec.code} className='home-spec-card' onClick={() => handleSpecSelect(spec)}>
              <View className='home-spec-row'>
                <Text className='home-spec-name'>{spec.name}</Text>
                <View className='home-spec-tag'>
                  <Text className='home-spec-tag-text'>{spec.bgColors?.length ? '合回执' : '电子照'}</Text>
                </View>
              </View>
              <Text className='home-spec-size'>像素尺寸：{spec.widthPx}x{spec.heightPx}px</Text>
              <View className='home-spec-chip'>
                <Text className='home-spec-chip-text'>{spec.dpi} DPI</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className='home-floating'>
        <Image className='home-floating-icon' src={icons.customerService} />
      </View>
    </View>
  )
}
