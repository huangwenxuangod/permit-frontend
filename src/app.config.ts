export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/orders/index',
    'pages/my/index'
  ],
  subPackages: [
    {
      root: 'subpackages',
      pages: [
        'search/index',
        'camera-guide/index',
        'camera/index',
        'detection/index',
        'detect-result/index',
        'preview/index',
        'order-confirm/index'
      ]
    }
  ],
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#16A34A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/首页.png',
        selectedIconPath: 'assets/icons/首页.png'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: 'assets/icons/订单.png',
        selectedIconPath: 'assets/icons/订单.png'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/icons/我的.png',
        selectedIconPath: 'assets/icons/我的.png'
      }
    ]
  }
})
