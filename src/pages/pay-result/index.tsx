import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'

export default function PayResultPage() {
  const router = useRouter()
  const { status } = router.params
  const isSuccess = status !== 'fail'

  const handleDownload = () => {
    const path = Taro.getStorageSync('selectedImagePath') as string
    if (!path) {
      Taro.showToast({ title: '无可下载图片', icon: 'none' })
      return
    }
    Taro.authorize({ scope: 'scope.writePhotosAlbum' }).catch(() => {})
    Taro.saveImageToPhotosAlbum({ filePath: path })
      .then(() => {
        Taro.showToast({ title: '保存成功', icon: 'success' })
      })
      .catch(() => {
        Taro.showToast({ title: '保存失败，请检查权限', icon: 'none' })
      })
  }

  const handleHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }
  
  const handleViewOrder = () => {
    Taro.switchTab({ url: '/pages/orders/index' })
  }

  return (
    <View className='pay-result-page'>
      <View className='status-card'>
        <View className={`status-icon ${isSuccess ? 'success' : 'fail'}`}>
          <Image
            src={isSuccess ? icons.success : icons.error}
            style={{ width: '40px', height: '40px' }}
          />
        </View>
        <Text className='status-text'>{isSuccess ? '支付成功' : '支付失败'}</Text>
        {isSuccess && <Text className='order-no'>订单号：#2026-000001</Text>}
      </View>

      {isSuccess && (
        <View className='action-area'>
          <View className='action-btns'>
            <Button className='btn-primary' onClick={handleDownload}>下载电子照</Button>
            <Button className='btn-secondary' onClick={handleViewOrder}>查看回执办理</Button>
          </View>
          <Text className='hint-text'>若未自动保存，可在“我的订单”中再次下载</Text>
        </View>
      )}

      <View className='footer'>
        <Button className='btn-home' onClick={handleHome}>返回首页</Button>
      </View>
    </View>
  )
}
