import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec } from '../../services/api'
import './index.scss'

const categories = ['全部', '寸照', '回执', '签证', '考试']
export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [specs, setSpecs] = useState<Spec[]>([])

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleSelect = (spec: Spec) => {
    Taro.setStorageSync('selectedSpec', spec)
    Taro.navigateTo({ url: '/pages/camera-guide/index' })
  }

  const loadSpecs = (query?: string) => {
    api.getSpecs(query).then(setSpecs).catch(() => setSpecs([]))
  }

  useEffect(() => {
    loadSpecs()
  }, [])

  const filteredSpecs = useMemo(() => {
    const category = categories[activeIndex]
    if (category === '全部') return specs
    return specs.filter(spec => spec.name.includes(category))
  }, [activeIndex, specs])

  return (
    <View className='search'>
      <View className='search-header'>
        <Text className='search-back' onClick={handleBack}>返回</Text>
        <Text className='search-title'>搜索</Text>
        <View className='search-space' />
      </View>
      <View className='search-box'>
        <Input
          className='search-input'
          placeholder='请输入规格名称'
          value={keyword}
          onInput={event => setKeyword(event.detail.value)}
        />
        <Text className='search-button' onClick={() => loadSpecs(keyword)}>搜索</Text>
      </View>
      <View className='search-tabs'>
        {categories.map((item, index) => (
          <View
            key={item}
            className={`search-tab ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <Text>{item}</Text>
          </View>
        ))}
      </View>
      <View className='search-grid'>
        {filteredSpecs.map(spec => (
          <View key={spec.code} className='search-card' onClick={() => handleSelect(spec)}>
            <View className='search-card-header'>
              <Text className='search-card-title'>{spec.name}</Text>
              <Text className='search-card-tag'>{spec.bgColors?.length ? '合回执' : '电子照'}</Text>
            </View>
            <Text className='search-card-size'>像素尺寸：{spec.widthPx}x{spec.heightPx}px</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
