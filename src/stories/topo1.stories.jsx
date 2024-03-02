import React from 'react'
import { Demo1 } from './topo1'


export default {
  title: 'Example/拓扑图',
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


const topo = (args) => <Demo1 {...args} />
export const 拓扑图1 = topo.bind({})
拓扑图1.args = {
}
