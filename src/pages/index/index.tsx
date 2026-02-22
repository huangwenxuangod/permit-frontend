import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import './index.scss'
import { icons } from '../../assets/icons'
import { getSpecs } from '../../services/api'

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

  const fallbackSpecs = [
    { code: 'hk-macao', name: '港澳通行证', widthPx: 390, heightPx: 567, dpi: 300 },
    { code: 'id-card', name: '身份证', widthPx: 358, heightPx: 441, dpi: 300 },
    { code: 'passport', name: '护照', widthPx: 390, heightPx: 567, dpi: 300 },
    { code: 'social', name: '社保证', widthPx: 358, heightPx: 441, dpi: 300 },
    { code: 'driver', name: '驾驶证', widthPx: 260, heightPx: 378, dpi: 300 },
    { code: 'security', name: '保安证', widthPx: 358, heightPx: 441, dpi: 300 },
  ]
  const getCategory = (name = '') => {
    if (name.includes('回执')) return '回执'
    if (name.includes('签证') || name.toLowerCase().includes('visa')) return '签证'
    if (name.includes('考试') || name.includes('资格') || name.includes('教师')) return '考试'
    if (name.includes('寸')) return '寸照'
    return '其他'
  }

  const buildTags = (category: string) => {
    const tags = ['电子照']
    if (category !== '其他') tags.push(category)
    return tags
  }

  const toSpecView = (spec: { code?: string; name: string; widthPx: number; heightPx: number; dpi?: number }) => {
    const category = getCategory(spec.name)
    return {
      ...spec,
      size: `${spec.widthPx}x${spec.heightPx}px`,
      tags: buildTags(category),
    }
  }

  const [hotSpecs, setHotSpecs] = useState<Array<{ code?: string; name: string; widthPx: number; heightPx: number; dpi?: number; size: string; tags: string[] }>>(() => fallbackSpecs.map(toSpecView))

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

  useEffect(() => {
    let mounted = true
    getSpecs()
      .then((list) => {
        if (!mounted) return
        if (Array.isArray(list) && list.length > 0) {
          const views = list.map((item: any) => toSpecView({
            code: item.code,
            name: item.name,
            widthPx: item.widthPx,
            heightPx: item.heightPx,
            dpi: item.dpi,
          }))
          setHotSpecs(views.slice(0, 6))
        } else {
          setHotSpecs(fallbackSpecs.map(toSpecView))
        }
      })
      .catch(() => {
        if (!mounted) return
        setHotSpecs(fallbackSpecs.map(toSpecView))
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSpecClick = (spec) => {
    const code = spec.code || spec.name
    Taro.setStorageSync('selectedSpecCode', code)
    Taro.setStorageSync('selectedSpecDetail', {
      code,
      name: spec.name,
      widthPx: spec.widthPx,
      heightPx: spec.heightPx,
      dpi: spec.dpi || 300
    })
    Taro.navigateTo({ url: `/pages/camera-guide/index?spec=${code}` })
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
            <View key={spec.code || index} className='spec-card' onClick={() => handleSpecClick(spec)}>
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
