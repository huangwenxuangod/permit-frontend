import React, { useEffect, useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { images } from '../../assets/images'
import { getSpecs } from '../../services/api'

export default function CameraGuidePage() {
  const router = useRouter()
  const { spec } = router.params
  const specName = spec || '证件照'
  const [specDetail, setSpecDetail] = useState<{ itemId?: number | string; code?: string; name?: string; widthPx?: number; heightPx?: number; dpi?: number; availableColors?: string[] }>({
    name: specName,
    widthPx: 390,
    heightPx: 567,
    dpi: 300
  })
  const [bgColor, setBgColor] = useState('white')
  const [beautyOn, setBeautyOn] = useState(false)
  const [enhanceOn, setEnhanceOn] = useState(false)
  const [watermarkOn, setWatermarkOn] = useState(false)

  useEffect(() => {
    const cached = Taro.getStorageSync('selectedSpecDetail') as any
    if (cached && (cached.code === spec || cached.name === spec || !spec)) {
      setSpecDetail(cached)
      if (cached?.itemId !== undefined && cached?.itemId !== null) {
        Taro.setStorageSync('selectedSpecItemId', cached.itemId)
      }
      return
    }
    const run = async () => {
      try {
        const list = await getSpecs()
        if (Array.isArray(list)) {
          const found = list.find((item: any) => item.code === spec || item.specCode === spec || item.name === spec || item.specName === spec)
          if (found) {
            const availableColors = Array.isArray(found?.availableColors)
              ? found.availableColors
              : Array.isArray(found?.bgColors)
                ? found.bgColors
                : Array.isArray(found?.colors)
                  ? found.colors
                  : []
            const next = {
              itemId: found.itemId || found.id,
              code: found.specCode || found.code,
              name: found.name || found.specName,
              widthPx: found.widthPx || found.width,
              heightPx: found.heightPx || found.height,
              dpi: found.dpi || found.resolution || 300,
              availableColors
            }
            setSpecDetail(next)
            Taro.setStorageSync('selectedSpecDetail', next)
            if (next.itemId !== undefined && next.itemId !== null) {
              Taro.setStorageSync('selectedSpecItemId', next.itemId)
            }
          }
        }
      } catch {}
    }
    run()
  }, [spec])

  useEffect(() => {
    const storedBg = (Taro.getStorageSync('selectedBackground') as string) || (Taro.getStorageSync('previewColor') as string)
    if (storedBg) setBgColor(storedBg)
    const storedBeauty = Number(Taro.getStorageSync('beauty') || 0)
    const storedEnhance = Number(Taro.getStorageSync('enhance') || 0)
    const storedWatermark = Taro.getStorageSync('watermark')
    setBeautyOn(storedBeauty > 0)
    setEnhanceOn(storedEnhance > 0)
    setWatermarkOn(!!storedWatermark)
  }, [])

  useEffect(() => {
    if (spec) {
      Taro.setStorageSync('selectedSpecCode', spec)
    }
  }, [spec])

  useEffect(() => {
    if (!specDetail) return
    if (specDetail.code) Taro.setStorageSync('selectedSpecCode', specDetail.code)
    if (specDetail.itemId !== undefined && specDetail.itemId !== null) {
      Taro.setStorageSync('selectedSpecItemId', specDetail.itemId)
    }
  }, [specDetail])

  const getFileSize = async (path: string) => {
    try {
      const info = await Taro.getFileInfo({ filePath: path })
      if ('size' in info) return info.size
    } catch {}
    return undefined
  }

  const ensureImageUnderLimit = async (path: string) => {
    const limit = 2 * 1024 * 1024
    let currentPath = path
    let size = await getFileSize(currentPath)
    if (size !== undefined && size <= limit) {
      return { path: currentPath, compressed: false, tooLarge: false }
    }
    const qualities = [80, 60, 40]
    for (const quality of qualities) {
      try {
        const res = await Taro.compressImage({ src: currentPath, quality })
        currentPath = (res as any).tempFilePath || currentPath
      } catch {}
      size = await getFileSize(currentPath)
      if (size !== undefined && size <= limit) {
        return { path: currentPath, compressed: true, tooLarge: false }
      }
    }
    return { path: currentPath, compressed: true, tooLarge: true }
  }

  const handlePickImage = async (sourceType: ('album' | 'camera')[]) => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType,
        sizeType: ['compressed']
      })
      const path = res.tempFilePaths?.[0] || (res.tempFiles && res.tempFiles[0]?.path)
      if (!path) {
        Taro.showToast({ title: '选择失败', icon: 'none' })
        return
      }
      const result = await ensureImageUnderLimit(path)
      if (result.tooLarge) {
        Taro.showToast({ title: '图片超过2MB，请选择更小图片', icon: 'none' })
        return
      }
      if (result.compressed) {
        Taro.showToast({ title: '图片已压缩', icon: 'none' })
      }
      Taro.setStorageSync('selectedImagePath', result.path)
      Taro.setStorageSync('selectedSpecName', specName)
      Taro.navigateTo({ url: '/pages/detection/index' })
    } catch {
      Taro.showToast({ title: '未授权或已取消', icon: 'none' })
    }
  }

  const handleChooseImage = () => {
    handlePickImage(['album'])
  }

  const handleTakePhoto = () => {
    handlePickImage(['camera'])
  }

  return (
    <View className='camera-guide-page'>
      <View className='header'>
        <Text className='spec-name'>{specDetail.name || specName}</Text>
        <Text className='spec-tag'>合规制作</Text>
      </View>

      <View className='guide-content'>
        <View className='guide-item'>
          <Text className='guide-num'>1</Text>
          <Text className='guide-text'>纯色背景与均匀光线</Text>
        </View>
        <View className='guide-item'>
          <Text className='guide-num'>2</Text>
          <Text className='guide-text'>正对镜头头不倾斜</Text>
        </View>
        <View className='guide-item'>
          <Text className='guide-num'>3</Text>
          <Text className='guide-text'>避免反光</Text>
        </View>

        <View className='illustration-area'>
          <Image className='illustration-image' src={images.guideIllustration} mode='aspectFill' />
        </View>
      </View>

      <View className='spec-details'>
        <Text>冲印尺寸：33x48mm</Text>
        <Text>像素尺寸：{specDetail.widthPx || 390}x{specDetail.heightPx || 567}px</Text>
        <Text>分辨率：{specDetail.dpi || 300}DPI</Text>
      </View>

      <View className='option-card'>
        <Text className='option-title'>背景颜色</Text>
        <View className='color-options'>
          {(specDetail.availableColors && specDetail.availableColors.length > 0 ? specDetail.availableColors : ['white', 'blue', 'red']).map((color) => (
            <View
              key={color}
              className={`color-pill ${bgColor === color ? 'active' : ''}`}
              onClick={() => {
                setBgColor(color)
                Taro.setStorageSync('selectedBackground', color)
                Taro.setStorageSync('previewColor', color)
              }}
            >
              {color === 'white' ? '白底' : color === 'blue' ? '蓝底' : color === 'red' ? '红底' : color}
            </View>
          ))}
        </View>
        <Text className='option-title'>优化设置</Text>
        <View className='toggle-row'>
          <View
            className={`toggle-pill ${beautyOn ? 'active' : ''}`}
            onClick={() => {
              const next = !beautyOn
              setBeautyOn(next)
              Taro.setStorageSync('beauty', next ? 1 : 0)
            }}
          >
            美颜
          </View>
          <View
            className={`toggle-pill ${enhanceOn ? 'active' : ''}`}
            onClick={() => {
              const next = !enhanceOn
              setEnhanceOn(next)
              Taro.setStorageSync('enhance', next ? 1 : 0)
            }}
          >
            增强
          </View>
          <View
            className={`toggle-pill ${watermarkOn ? 'active' : ''}`}
            onClick={() => {
              const next = !watermarkOn
              setWatermarkOn(next)
              Taro.setStorageSync('watermark', next)
            }}
          >
            水印
          </View>
        </View>
      </View>

      <View className='action-buttons'>
        <Button className='btn-secondary' onClick={handleChooseImage}>相册选取</Button>
        <Button className='btn-primary' onClick={handleTakePhoto}>现在拍摄</Button>
      </View>
    </View>
  )
}
