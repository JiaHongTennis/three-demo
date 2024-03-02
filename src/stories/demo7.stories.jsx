import React from 'react'
import { Demo1 } from './demo7'


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


const demo7_1 = (args) => <Demo1 {...args} />
export const 粒子效果_点对象基本使用 = demo7_1.bind({})
粒子效果_点对象基本使用.args = {
}

const demo7_2 = (args) => <Demo1 {...args} />
export const 粒子效果_点对象添加贴图 = demo7_2.bind({})
粒子效果_点对象添加贴图.args = {
  // 添加点对象材质纹理图片
  addImg: true
}
