import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const tools = ['背景', '换装', '美颜', '增强']

export default function Preview() {
  const handleNext = () => {
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  return (
    <View className='preview'>
      <View className='preview-header'>
        <Text className='preview-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='preview-title'>相片预览</Text>
        <View className='preview-space' />
      </View>

      <View className='preview-tabs'>
        <Text className='preview-tab active'>单张照预览</Text>
        <Text className='preview-tab'>排版照预览</Text>
      </View>

      <View className='preview-photo'>
        <View className='preview-frame' />
        <View className='preview-badge'>预览图</View>
      </View>

      <View className='preview-tools'>
        {tools.map(tool => (
          <View key={tool} className='preview-tool'>
            <View className='preview-tool-icon' />
            <Text className='preview-tool-text'>{tool}</Text>
          </View>
        ))}
      </View>

      <View className='preview-footer'>
        <View className='preview-next' onClick={handleNext}>下一步</View>
      </View>
    </View>
  )
}
