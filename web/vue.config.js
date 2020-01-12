module.exports = {
  lintOnSave: false,
  pwa: {
    name: 'Stickers for Discord',
    themeColor: '#FC6262',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico'
    },
    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
};
