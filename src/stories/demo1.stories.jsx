import React from 'react'
import { Demo1 } from './demo1'


export default {
  title: 'Example/three基础使用',
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

const demo1_1 = (args) => <Demo1 {...args} />
export const 自动旋转 = demo1_1.bind({})
自动旋转.args = {
  demo: '1'
}

const demo1_2 = (args) => <Demo1 {...args} />
export const 轨道控制器 = demo1_2.bind({})
轨道控制器.args = {
  demo: '2'
}

const demo1_3 = (args) => <Demo1 {...args} />
export const 辅助线 = demo1_3.bind()
辅助线.args = {
  demo: '2',
  helper: true
}

const demo1_4 = (args) => <Demo1 {...args} />
export const 设置物体位置 = demo1_4.bind({})
设置物体位置.args = {
  demo: '2',
  helper: true,
  meshPosition: [5,0,0]
}

const demo1_5 = (args) => <Demo1 {...args} />
export const 设置物体缩放 = demo1_5.bind({})
设置物体缩放.args = {
  demo: '2',
  helper: true,
  meshScale: [1,2,3]
}

const demo1_6 = (args) => <Demo1 {...args} />
export const 设置物体旋转 = demo1_6.bind({})
设置物体旋转.args = {
  demo: '2',
  helper: true,
  meshRotation: [Math.PI / 4, 0, 0, 'XYZ']
}

const demo1_7 = (args) => <Demo1 {...args} />
export const GSAP动画 = demo1_7.bind({})
GSAP动画.args = {
  demo: '2',
  helper: true,
  gsapTo: true
}

const demo1_8 = (args) => <Demo1 {...args} />
export const 控制器的阻尼惯性 = demo1_8.bind({})
控制器的阻尼惯性.args = {
  demo: '2',
  helper: true,
  gsapTo: true,
  enableDamping: true
}

const demo1_9 = (args) => <Demo1 {...args} />
export const 监听页面变化自适应 = demo1_9.bind({})
监听页面变化自适应.args = {
  demo: '2',
  helper: true,
  gsapTo: true,
  enableDamping: true,
  resizeListener: true
}

const demo1_10 = (args) => <Demo1 {...args} />
export const 进入全屏跟退出全屏 = demo1_10.bind({})
进入全屏跟退出全屏.args = {
  demo: '2',
  helper: true,
  gsapTo: true,
  enableDamping: true,
  resizeListener: true,
  fullScreen: true
}

const demo1_11 = (args) => <Demo1 {...args} />
export const 使用调试UI工具 = demo1_11.bind({})
使用调试UI工具.args = {
  demo: '2',
  helper: true,
  enableDamping: true,
  resizeListener: true,
  datGui: true
}
