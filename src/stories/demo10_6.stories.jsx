import React from 'react'
import { Demo1 } from './demo10_6'

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


const demo10_6_1 = (args) => <Demo1 {...args} />
export const 点材质_星璇 = demo10_6_1.bind({})
点材质_星璇.args = {
  demo: '1'
}
