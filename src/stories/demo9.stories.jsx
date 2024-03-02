import React from 'react'
import { Demo1 } from './demo9'


export default {
  title: 'Example/物理引擎',
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


const demo9_1 = (args) => <Demo1 {...args} />
export const 物体受重力影响 = demo9_1.bind({})
物体受重力影响.args = {
}

const demo9_2 = (args) => <Demo1 {...args} />
export const 物体能碰撞到地面 = demo9_2.bind({})
物体能碰撞到地面.args = {
  // 能碰撞到地面
  demo: '2'
}

const demo9_3 = (args) => <Demo1 {...args} />
export const 物体碰撞能听到声音 = demo9_3.bind({})
物体碰撞能听到声音.args = {
  // 能碰撞到地面
  demo: '2',
  // 添加声音监听
  voice: true
}

const demo9_4 = (args) => <Demo1 {...args} />
export const 物体碰撞_增大弹性摩擦力 = demo9_4.bind({})
物体碰撞_增大弹性摩擦力.args = {
  // 能碰撞到地面
  demo: '2',
  // 添加声音监听
  voice: true,
  // 设置关联材质碰撞系数
  contactMaterial: true
}
