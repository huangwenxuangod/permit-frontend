import { View, Text, Camera } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function CameraPage() {
  const handleClose = () => {
    Taro.navigateBack()
  }

  const handleCapture = () => {
    Taro.navigateTo({ url: '/pages/detection/index' })
  }

  return (
    <View className='camera-page'>
      <Camera className='camera-preview' devicePosition='front' />
      <View className='camera-mask'>
        <View className='camera-frame' />
        <View className='camera-corners'>
          <View className='corner tl' />
          <View className='corner tr' />
          <View className='corner bl' />
          <View className='corner br' />
        </View>
      </View>
      <View className='camera-controls'>
        <Text className='camera-control ghost' onClick={handleClose}>关闭</Text>
        <View className='camera-shutter' onClick={handleCapture} />
        <Text className='camera-control ghost'>切换</Text>
      </View>
    </View>
  )
}
