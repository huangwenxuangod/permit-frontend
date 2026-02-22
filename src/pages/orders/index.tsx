import React from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import './index.scss'
import { icons } from '../../assets/icons'
import { getOrders } from '../../services/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setErrorText('')
      try {
        const res = await getOrders({ page: 1, pageSize: 20 })
        const list = res?.items || res?.data || res || []
        if (Array.isArray(list)) setOrders(list)
        else setOrders([])
      } catch {
        setErrorText('订单加载失败，请下拉重试')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const formatAmount = (amountCents?: number) => {
    if (typeof amountCents !== 'number') return '--'
    return (amountCents / 100).toFixed(2)
  }

  const formatItems = (items?: Array<{ type?: string; qty?: number }>) => {
    if (!Array.isArray(items) || items.length === 0) return '未填写商品'
    const map: Record<string, string> = { electronic: '电子照', layout: '排版照', receipt: '回执' }
    return items.map(i => `${map[i.type || ''] || '商品'}${i.qty ? `x${i.qty}` : ''}`).join('、')
  }

  const formatStatus = (status?: string) => {
    if (status === 'paid') return '已完成'
    if (status === 'pending' || status === 'created') return '待支付'
    if (status === 'canceled') return '已取消'
    if (status === 'refunded') return '已退款'
    return status || '未知'
  }

  const formatChannel = (channel?: string) => {
    if (channel === 'wechat') return '微信'
    if (channel === 'douyin') return '抖音'
    return channel || '其他'
  }

  const formatOrderId = (id?: string) => {
    if (!id) return '订单'
    if (id.length <= 16) return `订单号：${id}`
    return `订单号：${id.slice(0, 8)}...${id.slice(-4)}`
  }

  return (
    <View className='orders-page'>
      <View className='warning-bar'>
        <Image src={icons.error} style={{ width: '14px', height: '14px', marginRight: '4px' }} />
        <Text>系统只保留近90天的订单，请在订单完成后及时保存</Text>
      </View>

      <ScrollView scrollY className='order-list'>
        {loading ? (
          <View className='order-item'>
            <View className='order-content'>
              <Text className='order-details'>订单加载中...</Text>
            </View>
          </View>
        ) : errorText ? (
          <View className='order-item'>
            <View className='order-content'>
              <Text className='order-details'>{errorText}</Text>
            </View>
          </View>
        ) : orders.length === 0 ? (
          <View className='order-item'>
            <View className='order-content'>
              <Text className='order-details'>暂无订单，可先制作一张证件照</Text>
            </View>
          </View>
        ) : orders.map(order => {
          const statusText = formatStatus(order.status)
          const statusClass = statusText === '待支付' ? 'pending' : 'completed'
          return (
            <View key={order.orderId || order.id} className='order-item'>
              <View className='order-thumb'></View>
              <View className='order-content'>
                <View className='order-header'>
                  <Text className='order-name'>{formatOrderId(order.orderId)}</Text>
                  <Text className='order-tag'>{formatChannel(order.channel)}</Text>
                </View>
                <Text className='order-details'>商品：{formatItems(order.items)}</Text>
                <View className='order-footer'>
                  <Text className='order-price'>￥{formatAmount(order.amountCents)}</Text>
                  <Text className={`order-status ${statusClass}`}>
                    {statusText}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
