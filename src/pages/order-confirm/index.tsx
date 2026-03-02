import { View, Text, Input } from '@tarojs/components'
import './index.scss'

export default function OrderConfirm() {
  return (
    <View className='order-confirm'>
      <View className='order-header'>
        <Text className='order-title'>订单确认</Text>
      </View>

      <View className='order-card'>
        <View className='order-images'>
          <View className='order-thumb' />
          <View className='order-layout' />
        </View>
        <View className='order-info'>
          <Text className='order-info-title'>居住证 · 认证回执</Text>
          <Text className='order-info-sub'>回执 + 电子照</Text>
        </View>
        <View className='order-price'>
          <Text className='order-price-new'>¥25.00</Text>
          <Text className='order-price-old'>¥35.00</Text>
        </View>
      </View>

      <View className='order-benefits'>
        <Text>官方认证回执，最快 3 分钟办理</Text>
        <Text>在线指导拍摄与办理</Text>
      </View>

      <View className='order-form'>
        <View className='order-field'>
          <Text className='order-label'>办理城市</Text>
          <Input className='order-input' placeholder='请选择办理城市' />
        </View>
        <View className='order-field'>
          <Text className='order-label'>备注</Text>
          <Input className='order-input' placeholder='请输入备注' />
        </View>
      </View>

      <View className='order-footer'>
        <Text className='order-total'>合计 ¥25.00</Text>
        <View className='order-pay'>立即支付</View>
      </View>
    </View>
  )
}
