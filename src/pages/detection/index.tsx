import React from '@tarojs/react'
import { useEffect, useState,useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../services/api'
import './index.scss'

const initialChecks = [
  { label: '检测人像取景范围、头肩姿势是否标准', done: false },
  { label: '检测相片光线、色彩、清晰度', done: false },
  { label: '检测脸部表情、着装是否符合证件照要求', done: false },
  { label: '优化照片画质', done: false }
]

export default function Detection() {
  const [checks, setChecks] = useState(initialChecks)
  const [statusText, setStatusText] = useState('证件照生成中，预计耗时 5 秒左右')
  const progressRef = useRef(0)

  const handleFinish = () => {
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  useEffect(() => {
    const taskId = Taro.getStorageSync('taskId') as string | undefined
    if (!taskId) {
      setStatusText('未找到任务，请重新拍摄')
      return
    }
    let running = true
    const updateProgress = () => {
      progressRef.current = Math.min(progressRef.current + 1, initialChecks.length)
      setChecks(initialChecks.map((item, index) => ({
        ...item,
        done: index < progressRef.current
      })))
    }
    const poll = async () => {
      try {
        const task = await api.getTask(taskId)
        Taro.setStorageSync('task', task)
        if (task.status === 'done') {
          setChecks(initialChecks.map(item => ({ ...item, done: true })))
          setStatusText('生成完成')
          if (running) {
            Taro.navigateTo({ url: '/pages/preview/index' })
          }
          return
        }
        if (task.status === 'failed' || task.errorMsg) {
          Taro.setStorageSync('taskError', task.errorMsg || '检测未通过')
          if (running) {
            Taro.navigateTo({ url: '/pages/detect-result/index' })
          }
          return
        }
        updateProgress()
      } catch (error) {
        setStatusText('网络异常，正在重试')
      }
    }
    poll()
    const timer = setInterval(poll, 2000)
    return () => {
      running = false
      clearInterval(timer)
    }
  }, [])

  return (
    <View className='detection'>
      <View className='detection-header'>
        <Text className='detection-back' onClick={() => Taro.navigateBack()}>返回</Text>
        <Text className='detection-title'>检测相片</Text>
        <View className='detection-space' />
      </View>

      <View className='detection-stage'>
        <View className='detection-photo'>
          <View className='detection-grid' />
          <View className='detection-face' />
          <View className='detection-scan' />
        </View>
      </View>

      <Text className='detection-status'>{statusText}</Text>

      <View className='detection-list'>
        {checks.map(item => (
          <View key={item.label} className='detection-item'>
            <View className={`detection-dot ${item.done ? 'done' : ''}`} />
            <Text className='detection-text'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='detection-footer'>
        <View className='detection-btn' onClick={handleFinish}>跳过动画</View>
      </View>
    </View>
  )
}
