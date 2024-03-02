import React from 'react'
import { Demo1 } from './demo10_2'

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
export const 顶点着色器_波浪效果 = demo10_2_1.bind({})
顶点着色器_波浪效果.args = {
  demo: '1'
}

const demo10_2_2 = (args) => <Demo1 {...args} />
export const 时间_波浪效果动起来 = demo10_2_2.bind({})
时间_波浪效果动起来.args = {
  demo: '2'
}
