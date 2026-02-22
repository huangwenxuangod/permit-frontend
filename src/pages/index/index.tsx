import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const services = [
    { name: '制作证件照', label: '拍', color: 'blue', enabled: true },
    { name: '修复老照片', label: '修', color: 'purple', enabled: false },
    { name: '回执专区', label: '回', color: 'orange', enabled: true },
  ]
  const serviceIconKeyMap: Record<string, keyof typeof icons> = {
    '拍': 'camera',
    '修': 'edit',
    '回': 'orders',
    '清': 'success',
    '色': 'picture',
    '大': 'editFile',
  }

  const hotSpecs = [
    { name: '港澳通行证', size: '390x567px', tags: ['合回执', '电子照'] },
    { name: '身份证', size: '358x441px', tags: ['合回执', '电子照'] },
    { name: '护照', size: '390x567px', tags: ['合回执', '电子照'] },
    { name: '社保证', size: '358x441px', tags: ['合回执', '电子照'] },
    { name: '驾驶证', size: '260x378px', tags: ['电子照'] },
    { name: '保安证', size: '358x441px', tags: ['电子照'] },
  ]

  const handleMoreSpecs = () => {
    Taro.navigateTo({ url: '/pages/specs/index' })
  }

  const handleServiceClick = (item) => {
    if (item.label === '修') {
      Taro.showToast({ title: '老照片修复还在开发中', icon: 'none' })
      return
    }
    if (item.label === '回') {
      Taro.navigateTo({ url: '/pages/specs/index' })
      return
    }
    Taro.navigateTo({ url: '/pages/specs/index' })
  }

  const handleSpecClick = (specName) => {
    // Navigate to camera guide
    Taro.navigateTo({ url: `/pages/camera-guide/index?spec=${specName}` })
  }

  return (
    <View className='index-page'>
      {/* Header Section */}
      <View className='header-section'>
        <View className='brand-tag'>
          <Image src={icons.success} style={{ width: '14px', height: '14px' }} />
          <Text>官方/机构认可</Text>
        </View>
        <View className='hero-banner'>
          <View className='hero-content'>
            <Text className='hero-title'>智能证件照制作</Text>
            <Text className='hero-subtitle'>专业 · 快捷 · 合规</Text>
            <Button className='hero-btn' onClick={handleMoreSpecs}>立即制作</Button>
          </View>
        </View>
      </View>

      {/* Services Grid */}
      <View className='section-container'>
        <View className='services-grid'>
          {services.map((item, index) => (
            <View key={index} className={`service-item ${item.enabled ? '' : 'disabled'}`} onClick={() => handleServiceClick(item)}>
              <View className={`service-icon bg-${item.color}-100`}>
                <Image src={icons[serviceIconKeyMap[item.label]]} style={{ width: '24px', height: '24px' }} />
              </View>
              <Text className='service-name'>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Hot Specs */}
      <View className='section-container'>
        <View className='section-header'>
          <View className='section-title-wrapper'>
            <Text className='section-title'>热门证照规格</Text>
            <Text className='section-tag'>HOT</Text>
          </View>
          <Text className='section-more' onClick={handleMoreSpecs}>更多规格 &gt;</Text>
        </View>
        
        <View className='specs-list'>
          {hotSpecs.map((spec, index) => (
            <View key={index} className='spec-card' onClick={() => handleSpecClick(spec.name)}>
              <View className='spec-info'>
                <Text className='spec-name'>{spec.name}</Text>
                <Text className='spec-size'>{spec.size}</Text>
              </View>
              <View className='spec-tags'>
                {spec.tags.map((tag, tIndex) => (
                  <Text key={tIndex} className={`tag ${tag === '合回执' ? 'tag-primary' : 'tag-success'}`}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Floating CS Button */}
      <View className='floating-cs'>
        <Image src={icons.customerService} style={{ width: '24px', height: '24px' }} />
      </View>
    </View>
  )
}
