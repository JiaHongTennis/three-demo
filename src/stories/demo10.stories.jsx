import React from 'react'
import { Demo1 } from './demo10'

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


const demo10_1 = (args) => <Demo1 {...args} />
export const 使用着色器材质 = demo10_1.bind({})
使用着色器材质.args = {
}

const demo10_2 = (args) => <Demo1 {...args} />
export const 使用原始着色器材质 = demo10_2.bind({})
使用原始着色器材质.args = {
  isRow: true
}

