import React from 'react'
import { Demo1 } from './demo7_2'


export default {
  title: 'Example/粒子效果Points',
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


const demo7_2_1 = (args) => <Demo1 {...args} />
export const 粒子效果_星空效果 = demo7_2_1.bind({})
粒子效果_星空效果.args = {
}
