import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'
import { icons } from '../../assets/icons'
import { generateBackground, generateLayout, getDownloadInfo } from '../../services/api'

export default function PayResultPage() {
  const router = useRouter()
  const { status, orderId: orderIdFromQuery } = router.params
  const isSuccess = status !== 'fail'
  const [downloadUrl, setDownloadUrl] = React.useState<string>('')
  const [singleUrl, setSingleUrl] = React.useState<string>('')
  const [layoutUrl, setLayoutUrl] = React.useState<string>('')
  const orderId = (orderIdFromQuery as string) || (Taro.getStorageSync('orderId') as string) || ''

  const handleDownload = () => {
    const url = downloadUrl || (Taro.getStorageSync('processedUrls') as Record<string, string> || {})['white']
    if (!url) {
      Taro.showToast({ title: '无可下载图片', icon: 'none' })
      return
    }
    Taro.downloadFile({ url })
      .then(res => {
        const path = res.tempFilePath
        return Taro.saveImageToPhotosAlbum({ filePath: path })
      })
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

  React.useEffect(() => {
    if (!isSuccess) return
    const run = async () => {
      try {
        const taskId = Taro.getStorageSync('taskId') as string
        const finalColor = (Taro.getStorageSync('finalColor') as string) || 'white'
        const processed = (Taro.getStorageSync('processedUrls') as Record<string, string>) || {}
        const baseline = (Taro.getStorageSync('baselineUrl') as string) || ''
        const original = (Taro.getStorageSync('selectedImagePath') as string) || ''
        setSingleUrl(processed[finalColor] || baseline || original || '')
        const layoutMap = (Taro.getStorageSync('layoutUrls') as Record<string, string>) || {}
        if (layoutMap[finalColor]) setLayoutUrl(layoutMap[finalColor])
        if (taskId) {
          if (!processed[finalColor]) {
            const bg = await generateBackground(taskId, finalColor, 300, 0, 200)
            if (bg && bg.url) {
              processed[finalColor] = bg.url
              Taro.setStorageSync('processedUrls', processed)
            }
          }
          const info = await getDownloadInfo(taskId).catch(() => null)
          if (info && info.urls && info.urls[finalColor]) {
            setDownloadUrl(info.urls[finalColor])
          } else if (processed[finalColor]) {
            setDownloadUrl(processed[finalColor])
          }
          const spec = { widthPx: 295, heightPx: 413, dpi: 300 }
          const layoutRes: any = await generateLayout(taskId, finalColor, spec.widthPx, spec.heightPx, spec.dpi, 200).catch(() => null)
          const layoutUrlRes = layoutRes?.url || layoutRes?.layoutUrl || layoutRes?.processedUrls?.[finalColor]
          if (layoutUrlRes) {
            const next = { ...layoutMap, [finalColor]: layoutUrlRes }
            Taro.setStorageSync('layoutUrls', next)
            setLayoutUrl(layoutUrlRes)
          }
        }
      } catch (e) {
      }
    }
    run()
  }, [isSuccess])

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
        {isSuccess && orderId && <Text className='order-no'>订单号：#{orderId}</Text>}
      </View>

      {isSuccess && (
        <View className='action-area'>
          <View className='preview-card'>
            <View className='preview-item'>
              {singleUrl ? <Image className='preview-image' src={singleUrl} mode='aspectFill' /> : <Text className='preview-label'>单张照</Text>}
            </View>
            <View className='preview-item'>
              {layoutUrl ? <Image className='preview-image' src={layoutUrl} mode='aspectFill' /> : <Text className='preview-label'>排版照</Text>}
            </View>
          </View>
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
