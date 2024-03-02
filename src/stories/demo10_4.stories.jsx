import React from 'react'
import { Demo1 } from './demo10_4'

export default {
  title: 'Example/着色器',
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


const demo10_2_1 = (args) => <Demo1 {...args} />
export const 绘制立体飞线 = demo10_2_1.bind({})
绘制立体飞线.args = {
}
