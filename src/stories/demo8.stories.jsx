import React from 'react'
import { Demo1 } from './demo8'


export default {
  title: 'Example/投射光线_事件交互',
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


const demo8_1 = (args) => <Demo1 {...args} />
export const 点击变红色 = demo8_1.bind({})
点击变红色.args = {
}
