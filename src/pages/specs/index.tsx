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

  const specs = (remoteSpecs.length > 0 ? remoteSpecs.map(s => ({
    code: s.code,
    name: s.name,
    size: `${s.widthPx}x${s.heightPx}px`,
    tags: ['电子照']
  })) : [
    { code: 'residence', name: '居住证', size: '358x441px', tags: ['电子照'] },
    { code: 'social', name: '社保证', size: '358x441px', tags: ['电子照'] },
    { code: '1inch', name: '一寸', size: '295x413px', tags: ['电子照'] },
    { code: '2inch', name: '二寸', size: '413x579px', tags: ['电子照'] },
    { code: 'small-2inch', name: '小二寸', size: '413x531px', tags: ['电子照'] },
    { code: 'large-1inch', name: '大一寸', size: '390x567px', tags: ['电子照'] },
    { code: 'small-1inch', name: '小一寸', size: '260x378px', tags: ['电子照'] },
    { code: 'driver', name: '驾驶证', size: '260x378px', tags: ['电子照'] },
    { code: 'us-visa', name: '美国签证', size: '600x600px', tags: ['电子照'] },
    { code: 'teacher', name: '教师资格', size: '295x413px', tags: ['电子照'] },
  ])

  const filteredSpecs = specs.filter(spec => {
    const matchesSearch = spec.name.includes(searchQuery)
    return matchesSearch
  })

  const handleSpecClick = (spec) => {
    const code = (spec.code || spec.name)
    Taro.setStorageSync('selectedSpecCode', code)
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
          <View className='search-btn' onClick={() => {}}>搜索</View>
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
