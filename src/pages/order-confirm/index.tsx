import React from 'react'
import { View, Text, Button, Input, Picker } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function OrderConfirmPage() {
  const [city, setCity] = useState('')
  const [remark, setRemark] = useState('')
  
  const cities = ['广州', '深圳', '珠海', '佛山', '东莞', '中山']

  const handleCityChange = (e) => {
    setCity(cities[e.detail.value])
  }

  const handlePay = () => {
    // Navigate to pay result
    Taro.navigateTo({ url: '/pages/pay-result/index?status=success' })
  }

  return (
    <View className='order-confirm-page'>
      <View className='order-card'>
        <View className='thumbnails'>
           <View className='thumb-item'>单张</View>
           <View className='thumb-item'>排版</View>
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
        <Button className='btn-primary' onClick={handlePay}>立即支付</Button>
      </View>
    </View>
  )
}
