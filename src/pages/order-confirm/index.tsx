import React, { useEffect, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api, Spec, Task } from '../../services/api'
import './index.scss'

const provinceOptions = [
  { name: '广东', cities: ['广州', '深圳', '珠海', '汕头', '佛山', '韶关', '湛江', '肇庆', '江门', '茂名', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'] },
  { name: '北京', cities: ['北京'] },
  { name: '上海', cities: ['上海'] },
  { name: '天津', cities: ['天津'] },
  { name: '重庆', cities: ['重庆'] },
  { name: '浙江', cities: ['杭州', '宁波', '温州', '绍兴', '嘉兴', '金华', '台州', '湖州', '丽水', '衢州', '舟山'] },
  { name: '江苏', cities: ['南京', '苏州', '无锡', '常州', '南通', '徐州', '扬州', '泰州', '盐城', '镇江', '淮安', '连云港', '宿迁'] },
  { name: '山东', cities: ['济南', '青岛', '烟台', '潍坊', '威海', '临沂', '济宁', '淄博', '泰安', '聊城', '德州', '东营', '枣庄', '日照', '滨州', '菏泽'] },
  { name: '四川', cities: ['成都', '绵阳', '乐山', '德阳', '宜宾', '泸州', '南充', '达州', '眉山', '资阳', '广元', '遂宁', '内江', '雅安', '巴中', '自贡', '广安', '攀枝花'] },
  { name: '湖北', cities: ['武汉', '襄阳', '宜昌', '黄冈', '荆州', '黄石', '十堰', '孝感', '荆门', '咸宁', '鄂州', '随州', '恩施'] },
  { name: '湖南', cities: ['长沙', '株洲', '湘潭', '衡阳', '岳阳', '常德', '益阳', '郴州', '永州', '邵阳', '娄底', '怀化', '张家界', '湘西'] },
  { name: '河南', cities: ['郑州', '洛阳', '开封', '新乡', '南阳', '许昌', '周口', '焦作', '信阳', '平顶山', '安阳', '驻马店', '商丘', '漯河', '濮阳', '三门峡', '鹤壁'] },
  { name: '福建', cities: ['福州', '厦门', '泉州', '漳州', '莆田', '三明', '南平', '龙岩', '宁德'] },
  { name: '江西', cities: ['南昌', '赣州', '九江', '上饶', '宜春', '吉安', '抚州', '萍乡', '景德镇', '新余', '鹰潭'] },
  { name: '安徽', cities: ['合肥', '芜湖', '蚌埠', '阜阳', '马鞍山', '安庆', '淮南', '淮北', '铜陵', '宣城', '六安', '亳州', '池州', '宿州', '黄山'] },
  { name: '河北', cities: ['石家庄', '唐山', '保定', '邯郸', '廊坊', '沧州', '秦皇岛', '张家口', '承德', '邢台', '衡水'] },
  { name: '山西', cities: ['太原', '大同', '运城', '临汾', '长治', '晋中', '忻州', '吕梁', '晋城', '朔州'] },
  { name: '陕西', cities: ['西安', '咸阳', '宝鸡', '渭南', '汉中', '榆林', '延安', '安康', '商洛', '铜川'] },
  { name: '云南', cities: ['昆明', '曲靖', '玉溪', '大理', '丽江', '红河', '楚雄', '普洱', '保山', '临沧', '文山', '西双版纳', '昭通'] },
  { name: '贵州', cities: ['贵阳', '遵义', '六盘水', '安顺', '毕节', '铜仁', '黔东南', '黔南', '黔西南'] },
  { name: '广西', cities: ['南宁', '柳州', '桂林', '北海', '梧州', '玉林', '钦州', '贵港', '百色', '贺州', '河池', '来宾', '防城港', '崇左'] },
  { name: '海南', cities: ['海口', '三亚', '三沙', '儋州'] },
  { name: '辽宁', cities: ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'] },
  { name: '吉林', cities: ['长春', '吉林', '延边', '四平', '辽源', '通化', '白山', '白城', '松原'] },
  { name: '黑龙江', cities: ['哈尔滨', '齐齐哈尔', '牡丹江', '大庆', '佳木斯', '绥化', '鹤岗', '双鸭山', '七台河', '黑河', '伊春', '大兴安岭'] },
  { name: '内蒙古', cities: ['呼和浩特', '包头', '鄂尔多斯', '呼伦贝尔', '赤峰', '通辽', '巴彦淖尔', '乌兰察布', '兴安盟', '锡林郭勒', '阿拉善'] },
  { name: '宁夏', cities: ['银川', '石嘴山', '吴忠', '固原', '中卫'] },
  { name: '甘肃', cities: ['兰州', '天水', '白银', '酒泉', '嘉峪关', '张掖', '武威', '定西', '平凉', '庆阳', '陇南', '临夏', '甘南'] },
  { name: '青海', cities: ['西宁', '海东', '海西', '海北', '海南', '黄南', '果洛', '玉树'] },
  { name: '新疆', cities: ['乌鲁木齐', '克拉玛依', '喀什', '昌吉', '吐鲁番', '哈密', '伊犁', '巴州', '阿克苏', '克州', '塔城', '阿勒泰', '博州', '和田'] },
  { name: '西藏', cities: ['拉萨', '日喀则', '林芝', '山南', '昌都', '那曲', '阿里'] },
  { name: '香港', cities: ['香港'] },
  { name: '澳门', cities: ['澳门'] },
  { name: '台湾', cities: ['台北', '高雄', '台中', '台南', '新北'] }
]

export default function OrderConfirm() {
  const [spec, setSpec] = useState<Spec | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState(0)
  const [remark, setRemark] = useState('')
  const [amountCents] = useState(990)
  const [paying, setPaying] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)

  useEffect(() => {
    const storedSpec = Taro.getStorageSync('selectedSpec') as Spec | undefined
    const storedTask = Taro.getStorageSync('task') as Task | undefined
    if (storedSpec) setSpec(storedSpec)
    if (storedTask) setTask(storedTask)
  }, [])

  useEffect(() => {
    if (!province && provinceOptions.length > 0) {
      setProvince(provinceOptions[0].name)
    }
  }, [province])

  const currentProvince = provinceOptions[selectedProvinceIndex]
  const currentCities = currentProvince?.cities || []
  const cityDisplay = city ? (province ? `${province} ${city}` : city) : ''

  const openCityPicker = () => {
    if (province) {
      const index = provinceOptions.findIndex(item => item.name === province)
      if (index >= 0) {
        setSelectedProvinceIndex(index)
      }
    }
    setShowCityPicker(true)
  }

  const handlePay = async () => {
    if (paying) return
    if (!task?.id) {
      Taro.showToast({ title: '缺少任务信息', icon: 'none' })
      return
    }
    if (!city) {
      setShowCityPicker(true)
      return
    }
    try {
      setPaying(true)
      const order = await api.createOrder({
        taskId: task.id,
        items: [{ type: 'receipt', qty: 1 }],
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
      await api.payCallback(orderId, 'paid')
      const downloadInfo = await api.getDownloadInfo(task.id)
      Taro.setStorageSync('downloadUrls', downloadInfo.urls)
      Taro.setStorageSync('receiptUrls', downloadInfo.receiptUrls || {})
      Taro.setStorageSync('layoutUrls', downloadInfo.layoutUrls || {})
      const downloadToken = await api.createDownloadToken(task.id)
      const baseUrl = process.env.TARO_APP_BASE_URL || ''
      await api.downloadFile(`${baseUrl}/api/download/file?token=${downloadToken.token}`)
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
          <Text className='order-info-title'>{spec ? spec.name : '证件照'}</Text>
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
        <View className='order-field' onClick={openCityPicker}>
          <Text className='order-label'>办理城市</Text>
          <View className='order-input order-input-select'>
            <Text className={city ? 'order-input-text' : 'order-input-placeholder'}>
              {cityDisplay || '请选择办理城市'}
            </Text>
          </View>
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

      {showCityPicker && (
        <View className='order-city-mask' onClick={() => setShowCityPicker(false)}>
          <View className='order-city-sheet' onClick={event => event.stopPropagation()}>
            <View className='order-city-header'>
              <Text className='order-city-title'>选择办理城市</Text>
              <Text className='order-city-close' onClick={() => setShowCityPicker(false)}>关闭</Text>
            </View>
            <View className='order-city-body'>
              <View className='order-province-list'>
                {provinceOptions.map((item, index) => (
                  <View
                    key={item.name}
                    className={`order-province-item ${selectedProvinceIndex === index ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedProvinceIndex(index)
                      setProvince(item.name)
                      if (!item.cities.includes(city)) {
                        setCity('')
                      }
                    }}
                  >
                    <Text>{item.name}</Text>
                  </View>
                ))}
              </View>
              <View className='order-city-grid'>
                {currentCities.map(item => (
                  <View
                    key={item}
                    className={`order-city-item ${city === item ? 'active' : ''}`}
                    onClick={() => {
                      setCity(item)
                      setProvince(currentProvince?.name || '')
                      setShowCityPicker(false)
                    }}
                  >
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
