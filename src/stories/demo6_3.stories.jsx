import React from 'react'
import { Demo1 } from './demo6_3'


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


const demo6_3_1 = (args) => <Demo1 {...args} />
export const 点光源_显示点光源 = demo6_3_1.bind({})
点光源_显示点光源.args = {
  // 设置阴影
  setShadow: true
}

const demo6_3_2 = (args) => <Demo1 {...args} />
export const 点光源_旋转动画 = demo6_3_2.bind({})
点光源_旋转动画.args = {
  // 设置阴影
  setShadow: true,
  // 绕圈旋转
  spotAnimation: true
}
