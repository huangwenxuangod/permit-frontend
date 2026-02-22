import React from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'
import { getSpecs } from '../../services/api'

// Specs Search Page
export default function SpecsPage() {
  const [activeTab, setActiveTab] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [remoteSpecs, setRemoteSpecs] = useState<Array<{ code: string, name: string, widthPx: number, heightPx: number, dpi: number }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSpecs()
      .then((list) => {
        if (Array.isArray(list)) {
          setRemoteSpecs(list as any)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tabs = ['全部', '寸照', '回执', '签证', '考试']

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

  const specs = (remoteSpecs.length > 0 ? remoteSpecs.map(s => {
    const category = getCategory(s.name)
    return {
      code: s.code,
      name: s.name,
      widthPx: s.widthPx,
      heightPx: s.heightPx,
      dpi: s.dpi,
      size: `${s.widthPx}x${s.heightPx}px`,
      category,
      tags: buildTags(category)
    }
  }) : [
    { code: 'residence', name: '居住证', widthPx: 358, heightPx: 441, dpi: 300 },
    { code: 'social', name: '社保证', widthPx: 358, heightPx: 441, dpi: 300 },
    { code: '1inch', name: '一寸', widthPx: 295, heightPx: 413, dpi: 300 },
    { code: '2inch', name: '二寸', widthPx: 413, heightPx: 579, dpi: 300 },
    { code: 'small-2inch', name: '小二寸', widthPx: 413, heightPx: 531, dpi: 300 },
    { code: 'large-1inch', name: '大一寸', widthPx: 390, heightPx: 567, dpi: 300 },
    { code: 'small-1inch', name: '小一寸', widthPx: 260, heightPx: 378, dpi: 300 },
    { code: 'driver', name: '驾驶证', widthPx: 260, heightPx: 378, dpi: 300 },
    { code: 'us-visa', name: '美国签证', widthPx: 600, heightPx: 600, dpi: 300 },
    { code: 'teacher', name: '教师资格', widthPx: 295, heightPx: 413, dpi: 300 },
  ].map(s => {
    const category = getCategory(s.name)
    return {
      ...s,
      size: `${s.widthPx}x${s.heightPx}px`,
      category,
      tags: buildTags(category)
    }
  }))

  const filteredSpecs = specs.filter(spec => {
    const query = searchQuery.trim()
    const matchesSearch = query ? spec.name.includes(query) : true
    const matchesTab = activeTab === '全部' ? true : spec.category === activeTab
    return matchesSearch && matchesTab
  })

  const handleSearch = () => {
    const query = searchQuery.trim()
    setSearchQuery(query)
    if (!query) {
      Taro.showToast({ title: '请输入规格关键词', icon: 'none' })
    }
  }

  const handleSpecClick = (spec) => {
    const code = (spec.code || spec.name)
    Taro.setStorageSync('selectedSpecCode', code)
    Taro.setStorageSync('selectedSpecDetail', {
      code,
      name: spec.name,
      widthPx: spec.widthPx,
      heightPx: spec.heightPx,
      dpi: spec.dpi
    })
    Taro.navigateTo({ url: `/pages/camera-guide/index?spec=${code}` })
  }

  return (
    <View className='specs-page'>
      {/* Search Bar */}
      <View className='search-bar-container'>
        <View className='search-input-wrapper'>
          <Image src={icons.picture} style={{ width: '16px', height: '16px' }} />
          <Input 
            className='search-input' 
            placeholder='请输入规格关键词...' 
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
          <View className='search-btn' onClick={handleSearch}>搜索</View>
        </View>

        {/* Filter Tabs */}
        <ScrollView scrollX className='filter-tabs' showScrollbar={false}>
          {tabs.map((tab) => (
            <View 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Specs Grid */}
      <View className='specs-grid'>
        {loading ? (
          <Text className='loading-tip'>加载中...</Text>
        ) : filteredSpecs.length === 0 ? (
          <Text className='loading-tip'>没有匹配结果，可尝试更短的关键词</Text>
        ) : (
          filteredSpecs.map((spec, index) => (
            <View key={index} className='spec-card' onClick={() => handleSpecClick(spec)}>
              <View className='spec-preview'></View>
              <Text className='spec-name'>{spec.name}</Text>
              <Text className='spec-size'>{spec.size}</Text>
              <View className='spec-tags'>
                {spec.tags.map((tag, tIndex) => (
                  <Text key={tIndex} className={`tag ${tag === '合回执' ? 'tag-primary' : 'tag-success'}`}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
