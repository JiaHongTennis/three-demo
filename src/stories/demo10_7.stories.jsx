import React from 'react'
import { Demo1 } from './demo10_7'

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


const demo10_7_1 = (args) => <Demo1 {...args} />
export const 基础材质_着色器源码修改 = demo10_7_1.bind({})
基础材质_着色器源码修改.args = {
  demo: '1'
}
