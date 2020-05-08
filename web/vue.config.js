module.exports = {
  lintOnSave: false,
  pwa: {
    name: 'Sticker Surge',
    themeColor: '#FC6262',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'img/icons/favicon.png',
      favicon16: 'img/icons/favicon.png',
      appleTouchIcon: 'img/icons/favicon.png',
      maskIcon: 'img/icons/favicon.png',
      msTileImage: 'img/icons/favicon.png'
    },
    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
};
