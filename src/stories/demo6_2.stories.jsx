import React from 'react'
import { Demo1 } from './demo6_2'


export default {
  title: 'Example/灯光/点光源PointLight',
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


const demo6_2_1 = (args) => <Demo1 {...args} />
export const 点光源_使用 = demo6_2_1.bind({})
点光源_使用.args = {
  // 设置阴影
  setShadow: true
}

const demo6_2_2 = (args) => <Demo1 {...args} />
export const 点光源_物理真实衰减 = demo6_2_2.bind({})
点光源_物理真实衰减.args = {
  // 设置阴影
  setShadow: true,
  // 开启渲染器物理正确光照模式
  physicallyCorrectLights: true
}
