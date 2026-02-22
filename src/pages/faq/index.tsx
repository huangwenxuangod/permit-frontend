import React from 'react'
import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    { q: '如何选择证件照规格？', a: '在“规格搜索”页输入关键词，或选择分类标签快速定位。' },
    { q: '图片上传失败怎么办？', a: '请检查网络并确保图片小于2MB，必要时重新选择或拍摄。' },
    { q: '如何下载电子照？', a: '支付成功后可在结果页或订单页重新下载。' },
    { q: '可以更换背景色吗？', a: '在预览页支持白/蓝/红底切换。' }
  ]

  return (
    <View className='faq-page'>
      <View className='section-card'>
        <Text className='section-title'>常见问题</Text>
        {faqs.map((item, index) => (
          <View key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <View className='faq-question'>
              <Text className='q-text'>{item.q}</Text>
              <Text className='q-icon'>{openIndex === index ? '−' : '+'}</Text>
            </View>
            {openIndex === index && (
              <Text className='faq-answer'>{item.a}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  )
}
