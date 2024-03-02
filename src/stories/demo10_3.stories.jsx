import React from 'react'
import { Demo1 } from './demo10_3'

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


const demo10_3_1 = (args) => <Demo1 {...args} />
export const 着色器_绘制各种图案 = demo10_3_1.bind({})
着色器_绘制各种图案.args = {
}
