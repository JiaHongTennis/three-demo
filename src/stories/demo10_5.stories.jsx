import React from 'react'
import { Demo1 } from './demo10_5'

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


const demo10_3_1 = (args) => <Demo1 {...args} />
export const 点材质着色器 = demo10_3_1.bind({})
点材质着色器.args = {
  demo: '1'
}

const demo10_3_2 = (args) => <Demo1 {...args} />
export const 点材质_导入纹理 = demo10_3_2.bind({})
点材质_导入纹理.args = {
  demo: '2'
}
