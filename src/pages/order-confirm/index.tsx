import React from 'react'
import { View, Text, Button, Input, Picker, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { createOrder, payWechat, generateLayout } from '../../services/api'

export default function OrderConfirmPage() {
  const [city, setCity] = useState('')
  const [remark, setRemark] = useState('')
  const [paying, setPaying] = useState(false)
  const [singleUrl, setSingleUrl] = useState('')
  const [layoutUrl, setLayoutUrl] = useState('')
  const [previewColor, setPreviewColor] = useState('white')
  
  const cities = ['广州', '深圳', '珠海', '佛山', '东莞', '中山']

  const handleCityChange = (e) => {
    setCity(cities[e.detail.value])
  }

  useEffect(() => {
    const color = (Taro.getStorageSync('previewColor') as string) || 'white'
    setPreviewColor(color)
    const processed = (Taro.getStorageSync('processedUrls') as Record<string, string>) || {}
    const baseline = (Taro.getStorageSync('baselineUrl') as string) || ''
    const original = (Taro.getStorageSync('selectedImagePath') as string) || ''
    setSingleUrl(processed[color] || baseline || original || '')
    const layoutMap = (Taro.getStorageSync('layoutUrls') as Record<string, string>) || {}
    if (layoutMap[color]) setLayoutUrl(layoutMap[color])
  }, [])

  useEffect(() => {
    const run = async () => {
      if (layoutUrl) return
      const taskId = Taro.getStorageSync('taskId') as string
      if (!taskId) return
      const spec = { widthPx: 295, heightPx: 413, dpi: 300 }
      const res: any = await generateLayout(taskId, previewColor, spec.widthPx, spec.heightPx, spec.dpi, 200).catch(() => null)
      const url = res?.url || res?.layoutUrl || res?.processedUrls?.[previewColor]
      if (url) {
        const layoutMap = (Taro.getStorageSync('layoutUrls') as Record<string, string>) || {}
        const next = { ...layoutMap, [previewColor]: url }
        Taro.setStorageSync('layoutUrls', next)
        setLayoutUrl(url)
      }
    }
    run()
  }, [layoutUrl, previewColor])

  const handlePay = async () => {
    if (paying) return
    if (!city) {
      try {
        const res = await Taro.showActionSheet({ itemList: cities })
        const selected = cities[res.tapIndex]
        if (selected) {
          setCity(selected)
        }
      } catch {}
      return
    }
    const previewColor = (Taro.getStorageSync('previewColor') as string) || 'white'
    Taro.setStorageSync('finalColor', previewColor)
    const taskId = Taro.getStorageSync('taskId') as string
    const amountCents = 2500
    const items = [{ type: 'electronic', qty: 1 }, { type: 'layout', qty: 1 }]
    const channel = 'wechat'
    if (!taskId) {
      Taro.showToast({ title: '任务不存在', icon: 'none' })
      return
    }
    try {
      setPaying(true)
      Taro.showLoading({ title: '支付中...' })
      const orderRes = await createOrder({ taskId, items, city, remark: remark || '', amountCents, channel })
      const orderId = orderRes?.orderId
      if (!orderId) {
        Taro.showToast({ title: '订单创建失败', icon: 'none' })
        return
      }
      Taro.setStorageSync('orderId', orderId)
      const payRes = await payWechat(orderId)
      const payParams = payRes?.payParams || payRes || {}
      const rawPrepay = payParams.package || payParams.prepay_id || payParams.prepayId
      const payPackage = rawPrepay
        ? (String(rawPrepay).startsWith('prepay_id=') ? rawPrepay : `prepay_id=${rawPrepay}`)
        : ''
      if (!payPackage) {
        Taro.showToast({ title: '支付参数缺失', icon: 'none' })
        Taro.navigateTo({ url: `/pages/pay-result/index?status=fail&orderId=${orderId}` })
        return
      }
      await Taro.requestPayment({
        timeStamp: String(payParams.timeStamp || payParams.timestamp || ''),
        nonceStr: payParams.nonceStr || payParams.nonce_str,
        package: payPackage,
        signType: payParams.signType || 'RSA',
        paySign: payParams.paySign || payParams.sign
      })
      Taro.navigateTo({ url: `/pages/pay-result/index?status=success&orderId=${orderId}` })
    } catch {
      Taro.navigateTo({ url: '/pages/pay-result/index?status=fail' })
    } finally {
      Taro.hideLoading()
      setPaying(false)
    }
  }

  return (
    <View className='order-confirm-page'>
      <View className='order-card'>
        <View className='thumbnails'>
           <View className='thumb-item'>
             {singleUrl ? <Image className='thumb-image' src={singleUrl} mode='aspectFill' /> : <Text className='thumb-label'>单张</Text>}
           </View>
           <View className='thumb-item'>
             {layoutUrl ? <Image className='thumb-image' src={layoutUrl} mode='aspectFill' /> : <Text className='thumb-label'>排版</Text>}
           </View>
        </View>
        
        <View className='order-info'>
          <View className='info-row'>
            <Text className='label'>商品：</Text>
            <View className='value'>
              <Text className='item-text'>照片回执 + 电子照</Text>
              <Text className='item-text'>排版照 ×1</Text>
            </View>
          </View>
          
          <View className='info-row'>
             <Text className='label'>价格：</Text>
             <Text className='price-original'>￥35.00</Text>
          </View>
          <View className='info-row'>
             <Text className='label'>优惠：</Text>
             <Text className='price-discount'>-￥10.00</Text>
          </View>
          <View className='info-row total-row'>
             <Text className='label'>合计：</Text>
             <Text className='price-total'>￥25.00</Text>
          </View>
        </View>
      </View>

      <View className='form-card'>
        <View className='form-item'>
          <Text className='label'>办理城市</Text>
          <Picker mode='selector' range={cities} onChange={handleCityChange}>
            <View className={`picker ${city ? '' : 'placeholder'}`}>
              {city || '请选择办理城市'}
            </View>
          </Picker>
        </View>
        <View className='form-item'>
          <Text className='label'>备注</Text>
          <Input 
            className='input' 
            placeholder='请输入备注' 
            value={remark}
            onInput={(e) => setRemark(e.detail.value)}
          />
        </View>
      </View>

      <View className='security-tags'>
        <View className='tag-item'>
          <Text className='icon'>✓</Text>
          <Text>官方认证回执</Text>
        </View>
        <View className='tag-item'>
          <Text className='icon'>✓</Text>
          <Text>在线指导</Text>
        </View>
      </View>

      <View className='footer'>
        <View className='total-info'>
          <Text>合计：</Text>
          <Text className='price'>￥25.00</Text>
        </View>
        <Button className='btn-primary' loading={paying} disabled={paying} onClick={handlePay}>立即支付</Button>
      </View>
    </View>
  )
}
