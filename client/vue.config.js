'use strict'
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:8002`,
        changeOrigin: true
      },
      '/avatar': {
        target: `http://127.0.0.1:8002`,
        changeOrigin: true
      },
    }
  },
  // configureWebpack: {
  //   // provide the app's title in webpack's name field, so that
  //   // it can be accessed in index.html to inject the correct title.
  //   name: name,
  //   resolve: {
  //     alias: {
  //       '@': resolve('src')
  //     }
  //   }
  // },
  // chainWebpack(config) {
    
  // }
}
