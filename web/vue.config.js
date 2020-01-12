module.exports = {
  lintOnSave: false,
  pwa: {
    name: 'Stickers for Discord',
    themeColor: '#FC6262',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'img/icons/favicon.ico',
      favicon16: 'img/icons/favicon.ico',
      appleTouchIcon: 'img/icons/favicon.ico',
      maskIcon: 'img/icons/favicon.ico',
      msTileImage: 'img/icons/favicon.ico'
    },
    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
};
