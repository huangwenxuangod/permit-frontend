import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const categories = ['全部', '寸照', '回执', '签证', '考试']
const specs = [
  { name: '居住证', size: '358x441px', tag: '合回执' },
  { name: '社保证', size: '358x441px', tag: '合回执' },
  { name: '一寸', size: '295x413px', tag: '电子照' },
  { name: '二寸', size: '413x579px', tag: '电子照' },
  { name: '小二寸', size: '413x531px', tag: '电子照' },
  { name: '大一寸', size: '390x567px', tag: '电子照' }
]

export default function Search() {
  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleSelect = () => {
    Taro.navigateTo({ url: '/pages/camera-guide/index' })
  }

  return (
    <View className='search'>
      <View className='search-header'>
        <Text className='search-back' onClick={handleBack}>返回</Text>
        <Text className='search-title'>搜索</Text>
        <View className='search-space' />
      </View>
      <View className='search-box'>
        <Input className='search-input' placeholder='请输入规格名称' />
        <Text className='search-button'>搜索</Text>
      </View>
      <View className='search-tabs'>
        {categories.map((item, index) => (
          <View key={item} className={`search-tab ${index === 0 ? 'active' : ''}`}>
            <Text>{item}</Text>
          </View>
        ))}
      </View>
      <View className='search-grid'>
        {specs.map(spec => (
          <View key={spec.name} className='search-card' onClick={handleSelect}>
            <View className='search-card-header'>
              <Text className='search-card-title'>{spec.name}</Text>
              <Text className='search-card-tag'>{spec.tag}</Text>
            </View>
            <Text className='search-card-size'>像素尺寸：{spec.size}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
