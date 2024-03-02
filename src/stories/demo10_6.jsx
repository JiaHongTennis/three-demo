import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// demo2顶点
import demo3VtShader from '../shader/pointShader/demo3/demo3.vt.glsl'
// demo2片元
import demo3FsShader from '../shader/pointShader/demo3/demo3.fs.glsl'
// 寻找素材地方 https://kenney.nl/assets

// 星璇效果，功能实现思路
// 先实现一条直线的随件点
// 第二步，将直线平均分给个个分支，算出个个分支角度所对应的位置
// 第三步， 我们需要将直线的分支变为曲线

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 加载图片1
    const textureImg1 = textureLoader.load(require('./images/textures/simpleShadow.jpg'))
    // 加载图片2
    const textureImg2 = textureLoader.load(require('./images/textures/xh.jpeg'))

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 40 )
    // 设置相机位置
    camera.position.set(0, 0, 20)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()

    // 星璇效果第一步，先设置参数来控制
    const params = {
      // 每一条线的数量
      count: 10000,
      // 半径也就是线的长度
      radius: 5,
      // 分支
      branch: 4,
      // 颜色
      color: '#ff0000',
      // 结束颜色
      endColor: '#0000ff',
      // 扭曲力度
      rotateSacle: 0.3
    }

    // 生成一条线,星璇最终是很多条线形成的
    let geometry = null
    let material = null
    let points = null
    const generateGalaxy = () => {
      // 生成顶点
      geometry = new THREE.BufferGeometry()
      // 随机生成位置
      const positions = new Float32Array(params.count * 3)
      // 设置顶点颜色
      const colors = new Float32Array(params.count * 3)

      // 图案属性
      const imgIndexs = new Float32Array(params.count)
      // 点的大小
      const aScales = new Float32Array(params.count)

      // 循环生成点的坐标信息

      // 定义一个开始颜色
      const firstColor = new THREE.Color(params.color)
      const endColor = new THREE.Color(params.endColor)

      for (let i = 0; i < params.count; i++) {
        // 思路我们需要添加一个结束的颜色endColor，再用THEEE 的lerp生成过度的颜色
        const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
        const distance = Math.random() * (Math.random()**3 * params.radius)
        const current = i * 3
        const randomX = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
        const randomY = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
        const randomZ = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
        // z轴
        // positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance + randomZ
        // 取消扭曲值
        positions[current] = Math.cos(branchAngel) * distance + randomZ
        // x轴
        positions[current + 1] = 0 + randomX
        // y轴
        // positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance + randomY
        // 取消扭曲值
        positions[current + 2] = Math.sin(branchAngel) * distance + randomY

        // 混合颜色，形成渐变色
        // 先克隆一个
        const mixColor = firstColor.clone()
        // 从0到1的渐变色,传入一个结束的颜色会将mixColor设置成中间过度的颜色
        // 根据点的半径以及最长半径，算出当前点的颜色
        mixColor.lerp(endColor, distance / params.radius)
        // 添加颜色RBG
        colors[current] = mixColor.r
        colors[current + 1] = mixColor.g
        colors[current + 2] = mixColor.b
        // 这里我们需要传入图片的属性，因为这里有两张图片，所以我们需要%2得到1 | 2的id
        imgIndexs[i] = i % 2
        // 点的大小添加一个随机值
        aScales[i] = Math.random()
      }
      // 这些本质上其实就是传个顶点着色器的属性
      // 顶点着色器可以使用attribute 关键字拿到这些属性;
      // 添加顶点属性
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      // 添加color属性
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      // 添加图片属性
      geometry.setAttribute('imgIndex', new THREE.BufferAttribute(imgIndexs, 1))
      // 添加点的大小,随机的大小
      geometry.setAttribute('aScale', new THREE.BufferAttribute(aScales, 1))


      // 这个是学习点材质的时候只做的星璇效果，现在我们需要替换为着色器材质
      // material = new THREE.PointsMaterial({
      //   // 关闭color，否则顶点颜色不起效果
      //   // color: new THREE.Color(params.color),
      //   // 大小
      //   size: params.size,
      //   // 尺寸(暂时不知道干嘛的)
      //   sizeAttenuation: true,
      //   // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
      //   depthWrite: false,
      //   // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
      //   blending: THREE.AdditiveBlending,
      //   // 颜色贴图
      //   map: textureSimpleShadow,
      //   // 透明贴图
      //   alphaMap: textureSimpleShadow,
      //   // 允许透明
      //   transparent: true,
      //   // 启用顶点颜色(没有geometry.setAttribute添加颜色的时候不能开启这个)
      //   vertexColors: true
      // })

      let vertexShader = ''
      let fragmentShader = ''

      if (props.demo === '1') {
        vertexShader = demo3VtShader
        fragmentShader = demo3FsShader
      }
      material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
        depthWrite: false,
        // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
        blending: THREE.AdditiveBlending,
        // 启用顶点颜色(没有geometry.setAttribute添加颜色的时候不能开启这个)
        vertexColors: true,
        // 传入一张图片
        uniforms: {
          // 传入一个时间,在动画那里改变时间
          uTime: {
            value: 0
          },
          uTexture1: {
            value: textureImg1
          },
          uTexture2: {
            value: textureImg2
          },
        }
      })



      // 创建点的对象生成点
      points = new THREE.Points(geometry, material)
      scene.add(points)
    }
    generateGalaxy()

    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    if (props.enableDamping) {
      controls.enableDamping = true * 0.3
    }

    // 设置时钟
    const clock = new THREE.Clock()

    function animate () {
      const time = clock.getElapsedTime()
      // 改变传入着色器的时间变量
      material.uniforms.uTime.value = time
      // 开启阻尼
      if (props.enableDamping) {
        controls.update()
      }
      requestAnimationFrame( animate )
      renderer.render( scene, camera )
    }
    animate()
    const axesHelper = new THREE.AxesHelper( 5 )
    scene.add( axesHelper )
    // 监听页面变化，更新渲染画面
    window.addEventListener('resize', () => {
      // 更新摄像头宽高比
      camera.aspect = rootRef.current.offsetWidth / rootRef.current.offsetHeight
      // 更新摄像机的投影矩阵
      camera.updateProjectionMatrix()
      // 更新渲染器
      renderer.setSize(rootRef.current.offsetWidth, rootRef.current.offsetHeight)
      // 设置渲染器的像素比
      renderer.setPixelRatio(window.devicePixelRatio)
    })
  }, [])

  return <div style={{width: '100%', height: '600px'}}>
    <div ref={rootRef} style={{width: '100%', height: '100%'}} />
  </div>
}
