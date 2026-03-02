import React, { useEffect, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec, Task } from '../../services/api'
import './index.scss'

export default function OrderConfirm() {
  const [spec, setSpec] = useState<Spec | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [city, setCity] = useState('')
  const [remark, setRemark] = useState('')
  const [amountCents] = useState(990)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const storedSpec = Taro.getStorageSync('selectedSpec') as Spec | undefined
    const storedTask = Taro.getStorageSync('task') as Task | undefined
    if (storedSpec) setSpec(storedSpec)
    if (storedTask) setTask(storedTask)
  }, [])

  const handlePay = async () => {
    if (paying) return
    if (!task?.id) {
      Taro.showToast({ title: '缺少任务信息', icon: 'none' })
      return
    }
    if (!city) {
      Taro.showToast({ title: '请选择办理城市', icon: 'none' })
      return
    }
    try {
      setPaying(true)
      const order = await api.createOrder({
        taskId: task.id,
        items: [{ type: 'print', qty: 1 }],
        city,
        remark,
        amountCents,
        channel: 'wechat'
      })
      const orderId = order.id
      if (!orderId) {
        Taro.showToast({ title: '订单创建失败', icon: 'none' })
        return
      }
      Taro.setStorageSync('latestOrderId', orderId)
      const payResult = await api.payWechat(orderId)
      const payParams = payResult.payParams
      await Taro.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType as 'RSA' | 'MD5',
        paySign: payParams.paySign
      })
      const downloadInfo = await api.getDownloadInfo(task.id)
      Taro.setStorageSync('downloadUrls', downloadInfo.urls)
      const downloadToken = await api.createDownloadToken(task.id)
      const baseUrl = process.env.TARO_APP_BASE_URL || ''
      await Taro.downloadFile({
        url: `${baseUrl}/api/download/file?token=${downloadToken.token}`
      })
      Taro.showToast({ title: '支付成功', icon: 'success' })
      Taro.switchTab({ url: '/pages/orders/index' })
    } catch (error) {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

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
          <Text className='order-info-title'>{spec ? `${spec.name} · ${spec.code}` : '证件照'}</Text>
          <Text className='order-info-sub'>回执 + 电子照</Text>
        </View>
        <View className='order-price'>
          <Text className='order-price-new'>¥{(amountCents / 100).toFixed(2)}</Text>
          <Text className='order-price-old'>¥{((amountCents + 1000) / 100).toFixed(2)}</Text>
        </View>
      </View>

      <View className='order-benefits'>
        <Text>官方认证回执，最快 3 分钟办理</Text>
        <Text>在线指导拍摄与办理</Text>
      </View>

      <View className='order-form'>
        <View className='order-field'>
          <Text className='order-label'>办理城市</Text>
          <Input
            className='order-input'
            placeholder='请选择办理城市'
            value={city}
            onInput={event => setCity(event.detail.value)}
          />
        </View>
        <View className='order-field'>
          <Text className='order-label'>备注</Text>
          <Input
            className='order-input'
            placeholder='请输入备注'
            value={remark}
            onInput={event => setRemark(event.detail.value)}
          />
        </View>
      </View>

      <View className='order-footer'>
        <Text className='order-total'>合计 ¥{(amountCents / 100).toFixed(2)}</Text>
        <View className='order-pay' onClick={handlePay}>立即支付</View>
      </View>
    </View>
  )
}
