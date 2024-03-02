import React from 'react'
import { Demo1 } from './demo9_2'


export default {
  title: 'Example/物理引擎',
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

const demo9_2_1 = (args) => <Demo1 {...args} />
export const 碰撞后旋转效果 = demo9_2_1.bind({})
碰撞后旋转效果.args = {
}

const demo9_2_2 = (args) => <Demo1 {...args} />
export const 根据方向按键给一个力 = demo9_2_2.bind({})
根据方向按键给一个力.args = {
  direction: true
}
