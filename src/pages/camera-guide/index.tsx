import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { images } from '../../assets/images'
import './index.scss'

export default function CameraGuide() {
  const handlePick = () => {
    Taro.navigateTo({ url: '/pages/camera/index' })
  }

  return (
    <View className='guide'>
      <View className='guide-header'>
        <Text className='guide-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='guide-title'>拍摄指引</Text>
        <View className='guide-space' />
      </View>

      <Text className='guide-spec'>居住证 · 认证回执</Text>

      <View className='guide-hero'>
        <Image className='guide-hero-image' src={images.guideIllustration} mode='aspectFit' />
      </View>

      <View className='guide-tips'>
        <Text>1. 选择纯色背景</Text>
        <Text>2. 正对镜头，头部不歪斜</Text>
        <Text>3. 确保脸部无阴影</Text>
      </View>

      <View className='guide-metrics'>
        <View className='guide-metric'>
          <Text className='guide-metric-label'>冲印尺寸</Text>
          <Text className='guide-metric-value'>26x32mm</Text>
        </View>
        <View className='guide-metric'>
          <Text className='guide-metric-label'>像素尺寸</Text>
          <Text className='guide-metric-value'>358x441px</Text>
        </View>
        <View className='guide-metric'>
          <Text className='guide-metric-label'>分辨率</Text>
          <Text className='guide-metric-value'>300DPI</Text>
        </View>
      </View>

      <View className='guide-actions'>
        <View className='guide-btn ghost' onClick={handlePick}>相册选取</View>
        <View className='guide-btn primary' onClick={handlePick}>现在拍摄</View>
      </View>
    </View>
  )
}
