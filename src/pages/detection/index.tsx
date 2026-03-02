import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const checks = [
  { label: '检测人像取景范围、头肩姿势是否标准', done: true },
  { label: '检测相片光线、色彩、清晰度', done: false },
  { label: '检测脸部表情、着装是否符合证件照要求', done: false },
  { label: '优化照片画质', done: false }
]

export default function Detection() {
  const handleFinish = () => {
    Taro.navigateTo({ url: '/pages/detect-result/index' })
  }

  return (
    <View className='detection'>
      <View className='detection-header'>
        <Text className='detection-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='detection-title'>检测相片</Text>
        <View className='detection-space' />
      </View>

      <View className='detection-stage'>
        <View className='detection-photo'>
          <View className='detection-grid' />
          <View className='detection-face' />
          <View className='detection-scan' />
        </View>
      </View>

      <Text className='detection-status'>证件照生成中，预计耗时 5 秒左右</Text>

      <View className='detection-list'>
        {checks.map(item => (
          <View key={item.label} className='detection-item'>
            <View className={`detection-dot ${item.done ? 'done' : ''}`} />
            <Text className='detection-text'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='detection-footer'>
        <View className='detection-btn' onClick={handleFinish}>跳过动画</View>
      </View>
    </View>
  )
}
