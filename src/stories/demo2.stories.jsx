import React from 'react'
import { Demo1 } from './demo2'


export default {
  title: 'Example/几何体学习',
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


const demo2_1 = (args) => <Demo1 {...args} />
export const BufferGeometry设置顶点创建矩形 = demo2_1.bind({})
BufferGeometry设置顶点创建矩形.args = {
}
