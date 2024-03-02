import React from 'react'
import { Demo1 } from './demo12'

export default {
  title: 'Example/线材质',
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


const demo12_1 = (args) => <Demo1 {...args} />
export const 绘制曲线 = demo12_1.bind({})
绘制曲线.args = {
  demo: '1'
}

const demo12_2 = (args) => <Demo1 {...args} />
export const 相机沿着曲线移动 = demo12_2.bind({})
相机沿着曲线移动.args = {
  demo: '2'
}

