import React from 'react'
import { Demo1 } from './webgl3'


export default {
  title: 'Example/webgl',
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


const webgl_3 = (args) => <Demo1 {...args} />
export const 通过帧定时器产生动画 = webgl_3.bind({})
通过帧定时器产生动画.args = {
}
