export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/specs/index',
    'pages/camera-guide/index',
    'pages/detection/index',
    'pages/preview/index',
    'pages/order-confirm/index',
    'pages/pay-result/index',
    'pages/orders/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '一照通',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#3B82F6',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
