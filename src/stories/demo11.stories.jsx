import React from 'react'
import { Demo1 } from './demo11'

export default {
  title: 'Example/css渲染器',
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


const demo11_1 = (args) => <Demo1 {...args} />
export const css2D渲染器 = demo11_1.bind({})
css2D渲染器.args = {
}

const demo11_2 = (args) => <Demo1 {...args} />
export const 地球背面文字隐藏 = demo11_2.bind({})
地球背面文字隐藏.args = {
  demo: '2'
}


