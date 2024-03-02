const path = require('path')
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    // "@storybook/preset-create-react-app"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  // 这个东西根本没执行,因为脚手架的原因
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.glsl$/i,
      loader: 'raw-loader'
    })
    return config;
  }
}
