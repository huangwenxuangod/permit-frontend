import { View, Text, Image } from '@tarojs/components'
import { icons } from '../../assets/icons'
import './index.scss'

const orders = []

export default function Orders() {
  return (
    <View className='orders'>
      <View className='orders-header'>
        <Text className='orders-title'>订单列表</Text>
      </View>
      <View className='orders-notice'>
        <Text className='orders-notice-text'>系统仅保留近 90 天的订单，请在订单完成后及时下载</Text>
      </View>
      {orders.length === 0 && (
        <View className='orders-empty'>
          <Image className='orders-empty-icon' src={icons.history} />
          <Text className='orders-empty-text'>暂无订单</Text>
        </View>
      )}
    </View>
  )
}
