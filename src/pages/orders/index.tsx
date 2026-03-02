import React, { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { icons } from '../../assets/icons'
import { api, Order } from '../../services/api'
import './index.scss'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    api.getOrders().then(result => setOrders(result.items)).catch(() => setOrders([]))
  }, [])

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
      {orders.length > 0 && (
        <View className='orders-list'>
          {orders.map((order, index) => (
            <View key={order.id || `${order.createdAt || ''}-${index}`} className='orders-card'>
              <View className='orders-card-row'>
                <Text className='orders-card-title'>订单 {order.id || '待确认'}</Text>
                <Text className='orders-card-status'>{order.status || '处理中'}</Text>
              </View>
              <Text className='orders-card-meta'>城市：{order.city || '-'}</Text>
              <Text className='orders-card-meta'>金额：¥{((order.amountCents || 0) / 100).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
