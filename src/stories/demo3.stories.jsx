import React from 'react'
import { Demo1 } from './demo3'


export default {
  title: 'Example/基础材质',
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


const demo3_1 = (args) => <Demo1 {...args} />
export const 导图图片设置颜色纹理 = demo3_1.bind({})
导图图片设置颜色纹理.args = {
}

const demo3_2 = (args) => <Demo1 {...args} />
export const 设置贴图属性偏移 = demo3_2.bind({})
设置贴图属性偏移.args = {
  mapStyleOffset: true
}

const demo3_3 = (args) => <Demo1 {...args} />
export const 设置贴图属性旋转 = demo3_3.bind({})
设置贴图属性旋转.args = {
  mapStyleRotation: true
}

const demo3_4 = (args) => <Demo1 {...args} />
export const 设置纹理的重复 = demo3_4.bind({})
设置纹理的重复.args = {
  mapStyleRepeat: true
}

const demo3_5 = (args) => <Demo1 {...args} />
export const 添加透明纹理 = demo3_5.bind({})
添加透明纹理.args = {
  mapStyleAlphaMap: true
}

const demo3_6 = (args) => <Demo1 {...args} />
export const 添加平面门 = demo3_6.bind({})
添加平面门.args = {
  mapStyleAlphaMap: 'addPlaneGeometry'
}

const demo3_7 = (args) => <Demo1 {...args} />
export const 添加环境遮挡贴图 = demo3_7.bind({})
添加环境遮挡贴图.args = {
  mapStyleAmbientOcclusion: true,
  mapStyleAlphaMap: true
}
