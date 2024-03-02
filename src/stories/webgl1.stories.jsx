import React from 'react'
import { Demo1 } from './webgl1'


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


const webgl_1 = (args) => <Demo1 {...args} />
export const 绘制简单3角形 = webgl_1.bind({})
绘制简单3角形.args = {
}


const webgl_2 = (args) => <Demo1 {...args} />
export const 三角形通过矩阵缩小 = webgl_2.bind({})
三角形通过矩阵缩小.args = {
}
