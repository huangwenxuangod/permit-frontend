import React from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import './index.scss'
import { icons } from '../../assets/icons'

export default function OrdersPage() {
  const orders = [
    { id: 1, name: '护照', tag: '认证回执', size: '33x48mm / 390x567px', price: '25.00', status: '已完成' },
    { id: 2, name: '港澳通行证', tag: '认证回执', size: '33x48mm / 390x567px', price: '25.00', status: '待支付' },
  ]

  return (
    <View className='orders-page'>
      <View className='warning-bar'>
        <Image src={icons.error} style={{ width: '14px', height: '14px', marginRight: '4px' }} />
        <Text>系统只保留近90天的订单，请在订单完成后及时保存</Text>
      </View>

      <ScrollView scrollY className='order-list'>
        {orders.map(order => (
          <View key={order.id} className='order-item'>
            <View className='order-thumb'>
               {/* Thumbnail placeholder */}
            </View>
            <View className='order-content'>
              <View className='order-header'>
                <Text className='order-name'>{order.name}</Text>
                {order.tag && <Text className='order-tag'>{order.tag}</Text>}
              </View>
              <Text className='order-details'>尺寸：{order.size}</Text>
              <View className='order-footer'>
                <Text className='order-price'>￥{order.price}</Text>
                <Text className={`order-status ${order.status === '待支付' ? 'pending' : 'completed'}`}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
