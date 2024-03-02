import React from 'react'
import { Demo1 } from './demo5'


export default {
  title: 'Example/阴影',
  argTypes: {
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '100%' }}>
        <Story />
      </div>
    ),
  ]
}


const demo5_1 = (args) => <Demo1 {...args} />
export const 阴影_投射到平面 = demo5_1.bind({})
阴影_投射到平面.args = {
  // 设置阴影
  setShadow: true
}

const demo5_2 = (args) => <Demo1 {...args} />
export const 阴影_设置阴影模糊度 = demo5_2.bind({})
阴影_设置阴影模糊度.args = {
  // 设置阴影
  setShadow: true,
  // 开启阴影模糊
  setShadowRadius: 20,
  // 阴影分辨率
  shadowMapSize: 512
}

