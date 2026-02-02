import React from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'
import { icons } from '../../assets/icons'

// Specs Search Page
export default function SpecsPage() {
  const [activeTab, setActiveTab] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['全部', '寸照', '回执', '签证', '考试']

  const specs = [
    { name: '居住证', size: '358x441px', category: '回执', tags: ['合回执', '电子照'] },
    { name: '社保证', size: '358x441px', category: '回执', tags: ['合回执', '电子照'] },
    { name: '一寸', size: '295x413px', category: '寸照', tags: ['电子照'] },
    { name: '二寸', size: '413x579px', category: '寸照', tags: ['电子照'] },
    { name: '小二寸', size: '413x531px', category: '寸照', tags: ['电子照'] },
    { name: '大一寸', size: '390x567px', category: '寸照', tags: ['电子照'] },
    { name: '小一寸', size: '260x378px', category: '寸照', tags: ['电子照'] },
    { name: '驾驶证', size: '260x378px', category: '考试', tags: ['电子照'] },
    { name: '美国签证', size: '600x600px', category: '签证', tags: ['电子照'] },
    { name: '教师资格', size: '295x413px', category: '考试', tags: ['电子照'] },
  ]

  const filteredSpecs = specs.filter(spec => {
    const matchesTab = activeTab === '全部' || spec.category === activeTab || (activeTab === '回执' && spec.tags.includes('合回执'))
    const matchesSearch = spec.name.includes(searchQuery)
    return matchesTab && matchesSearch
  })

  const handleSpecClick = (spec) => {
    // Navigate to camera guide
    console.log('Navigate to camera guide for', spec.name)
    // Taro.navigateTo({ url: `/pages/camera/index?spec=${spec.name}` })
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
        {filteredSpecs.map((spec, index) => (
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
        ))}
      </View>
    </View>
  )
}
