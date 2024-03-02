import React,{ useRef, useEffect } from 'react'

// 直接使用webgl绘制简单的3角形

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 设置canvas元素
    const canvas = rootRef.current
    // canvas宽高
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    // 获取webgl绘图的上下文，简单来说就是gl是绘图用的
    const gl = canvas.getContext('webgl')
    // 第一次创建webgl绘图上下文，需要设置视口大小
    gl.viewport(0, 0, canvas.width, canvas.height)

    window.top.gl = gl
    // 创建顶点着色器
    const veryexShder = gl.createShader(gl.VERTEX_SHADER)
    // 创建顶点着色器的代码，我们需要编写glsl代码
    // 着色器的源码, 第一个参数将顶点色器添加进来， 第二个参数glsl
    // 大致意思是  a_position是传进来的位置，需要放置到屏幕 gl_Position位置

    // 我们尝试将顶点着色器的gl_Position的值传到片元着色器中,因为位置跟颜色都是4维向量
    // 但是这样还不行，因为片着色器这里有一个数据的传递，我们需要让GPU去估算经度如何（precision mediump float;标识我们传递的数据是一个经度是一个浮点数，让我们GPU去准备一个计算量）
    gl.shaderSource(veryexShder, `
      attribute vec4 a_Position;
      uniform mat4 u_Mat;
      varying vec4 v_Color;
      void main() {
        gl_Position = u_Mat * a_Position;
        v_Color = gl_Position;
      }
    `)
    // 编译顶点着色器,因为我们最终需要让gpu执行二进制代码，所以需要编译
    gl.compileShader(veryexShder)

    // 创建片元着色器
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    // 设置片元着色器代码
    // 设置每个像素的颜色为红色
    gl.shaderSource(fragmentShader, `
      precision mediump float;
      varying vec4 v_Color;
      void main() {
        gl_FragColor = v_Color;
      }
    `)
    // 编译片元着色器
    gl.compileShader(fragmentShader)

    // 创建程序关联顶点着色器和片元着色器
    const program = gl.createProgram()
    // 关联顶点着色器和片元着色器
    gl.attachShader(program, veryexShder)
    gl.attachShader(program, fragmentShader)
    // 连接程序
    gl.linkProgram(program)

    // 使用程序进行渲染
    gl.useProgram(program)


    // 然后我们需要数据来渲染
    // 创建顶点缓冲区对象
    const vertexBuffer = gl.createBuffer()
    // 绑定顶点缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    // 向顶点缓冲区对象写入数据, 屏幕坐标是[-1, 1]
    // 创建顶点数据
    const vertices = new Float32Array([
      0.0, 0.5,
      -0.5, -0.5,
      0.5, -0.5
    ])
    // 将数据传入缓冲区中
    // gl.STATIC_DRAW表示数据不会变， gl.DYNAMIC_DRAW表示数据会变
    // gl.STATIC_DRAW性能会更好一些
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    // 然后我们需要把数据传给顶点着色器的 a_Position
    // 获取顶点着色器中的a_Position变量的位置
    const a_Position = gl.getAttribLocation(program, 'a_Position')
    // 将顶点缓冲区的数据分配给a_Position变量
    // 按2个值作为一组传
    // gl.FLOAT 类型为浮点数
    // false 这个是什么归一化处理（不是很清楚干嘛的）
    // 倒数第二个是是Float32Array是否进行跳跃获取，一般我们为0不跳跃
    // 最后一个参数是偏移， 从Float32Array的哪个位置开始获取，一般默认就好
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
    // 然后还需要启用顶点着色器a_Position变量
    gl.enableVertexAttribArray(a_Position)


    // 我们需要通过帧定时器不断绘制产生动画
    let scale = 0.5
    function animate () {
      // 改变缩放比例,然后不断从新绘制
      scale -= 0.01
      // 我们要实现缩小的话需要一个缩小矩阵 4*4向量
      // 定义缩小的变量
      const mat = new Float32Array(
        [
          scale, 0.0, 0.0, 0.0,
          0.0, scale, 0.0, 0.0,
          0.0, 0.0, scale, 0.0,
          0.0, 0.0, 0.0, 1.0
        ]
      )
      // 获取顶点着色器程序里面全局变量u_Mat
      const u_Mat = gl.getUniformLocation(program, 'u_Mat')
      // 然后将缩小矩阵给传进来
      // 第二个参数表示是否为转置矩阵
      // 第三个是矩阵数据
      gl.uniformMatrix4fv(u_Mat, false, mat)

      // 我们每次绘制之前都需要重新清除上一次绘制的结果
      // 清除canvas
      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      // 清除缓冲区
      gl.clear(gl.COLOR_BUFFER_BIT)
      // 绘制三角形
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      requestAnimationFrame(animate)
    }
    animate()

  }, [])

  return <div style={{width: '100%', height: '600px'}}>
    <canvas ref={rootRef} style={{width: '100%', height: '100%'}} />
  </div>
}
