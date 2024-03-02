const {
  override,
  addWebpackModuleRule,
} = require('customize-cra')

module.exports = override(
 addWebpackModuleRule({
    test: /\.glsl$/i, // 可以打包后缀为sass/scss/css的文件
    use: 'raw-loader'
  })
)
