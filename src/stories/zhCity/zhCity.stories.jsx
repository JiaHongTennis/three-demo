import React from 'react'
import { Demo1 } from './zhCity'

export default {
  title: 'Example/智慧城市',
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


const zhCity_1 = (args) => <Demo1 {...args} />
export const 加载模型 = zhCity_1.bind({})
加载模型.args = {
  demo: '1'
}
