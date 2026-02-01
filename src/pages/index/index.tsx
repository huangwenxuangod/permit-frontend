import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const services = [
    { name: '制作证件照', icon: '📷', color: 'blue' },
    { name: '修复老照片', icon: '✨', color: 'purple' },
    { name: '回执专区', icon: '📄', color: 'orange' },
    { name: '智能清晰', icon: '👁️', color: 'green' },
    { name: '换底色', icon: '🎨', color: 'pink' },
    { name: '改文件大小', icon: '📏', color: 'indigo' },
  ]

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

  return (
    <View className='index-page'>
      {/* Header Section */}
      <View className='header-section'>
        <View className='brand-tag'>
          <Text className='tag-icon'>✓</Text>
          <Text>官方/机构认可</Text>
        </View>
        <View className='hero-banner'>
          <View className='hero-content'>
            <Text className='hero-title'>智能证件照制作</Text>
            <Text className='hero-subtitle'>专业 · 快捷 · 合规</Text>
            <Button className='hero-btn'>立即制作</Button>
          </View>
        </View>
      </View>

      {/* Services Grid */}
      <View className='section-container'>
        <View className='services-grid'>
          {services.map((item, index) => (
            <View key={index} className='service-item'>
              <View className={`service-icon bg-${item.color}-100`}>
                <Text>{item.icon}</Text>
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
          <Text className='section-more'>更多规格 &gt;</Text>
        </View>
        
        <View className='specs-list'>
          {hotSpecs.map((spec, index) => (
            <View key={index} className='spec-card'>
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
        <Text>🎧</Text>
      </View>
    </View>
  )
}
