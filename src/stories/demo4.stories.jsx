import React from 'react'
import { Demo1 } from './demo4'


export default {
  title: 'Example/标准材质',
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


const demo4_1 = (args) => <Demo1 {...args} />
export const 标准材质_没有光 = demo4_1.bind({})
标准材质_没有光.args = {
}

const demo4_2 = (args) => <Demo1 {...args} />
export const 标准材质_添加环境光 = demo4_2.bind({})
标准材质_添加环境光.args = {
  AmbientLight: true
}

const demo4_3 = (args) => <Demo1 {...args} />
export const 标准材质_添加平行光 = demo4_3.bind({})
标准材质_添加平行光.args = {
  DirectionalLight: true
}

const demo4_4 = (args) => <Demo1 {...args} />
export const 标准材质_位移贴图 = demo4_4.bind({})
标准材质_位移贴图.args = {
  AmbientLight: true,
  mapStyleAlphaMap: 'addPlaneGeometry',
  displacementMap: true
}

const demo4_5 = (args) => <Demo1 {...args} />
export const 标准材质_粗糙度贴图 = demo4_5.bind({})
标准材质_粗糙度贴图.args = {
  AmbientLight: true,
  DirectionalLight: true,
  mapStyleAlphaMap: 'addPlaneGeometry',
  displacementMap: true,
  Roughness: true
}

const demo4_6 = (args) => <Demo1 {...args} />
export const 标准材质_金属贴图 = demo4_6.bind({})
标准材质_金属贴图.args = {
  AmbientLight: true,
  DirectionalLight: true,
  mapStyleAlphaMap: 'addPlaneGeometry',
  displacementMap: true,
  Roughness: true,
  metalnessMap: true
}

const demo4_7 = (args) => <Demo1 {...args} />
export const 标准材质_法线贴图 = demo4_7.bind({})
标准材质_法线贴图.args = {
  AmbientLight: true,
  DirectionalLight: true,
  mapStyleAlphaMap: 'addPlaneGeometry',
  displacementMap: true,
  Roughness: true,
  metalnessMap: true,
  normalMap: true
}

const demo4_8 = (args) => <Demo1 {...args} />
export const 标准材质_图片加载进度 = demo4_8.bind({})
标准材质_图片加载进度.args = {
  AmbientLight: true,
  DirectionalLight: true,
  mapStyleAlphaMap: 'addPlaneGeometry',
  displacementMap: true,
  Roughness: true,
  metalnessMap: true,
  normalMap: true,
  LoadingManager: true
}

