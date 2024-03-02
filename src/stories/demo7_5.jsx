import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import simpleShadow from './images/textures/simpleShadow.jpg'
// 寻找素材地方 https://kenney.nl/assets

// 星璇效果，功能实现思路
// 先实现一条直线的随件点
// 第二步，将直线平均分给个个分支，算出个个分支角度所对应的位置
// 第三步， 我们需要将直线的分支变为曲线

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 加载贴图材质
    const textureSimpleShadow = textureLoader.load(simpleShadow)

    // 创建场景
    const scene = new THREE.Scene()

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
      // 大小
      size: 0.1,
      // 半径也就是线的长度
      radius: 5,
      // 分支
      branch: 3,
      // 颜色
      color: '#ffffff',
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
      const color = new Float32Array(params.count * 3)
      // 循环生成点的坐标信息
      for (let i = 0; i < params.count; i++) {
        if (props.demo === '2') {
          // 第一步中我们，将因为点都在z轴所以 positions[current] = Math.random() * params.radius 可以直接设置
          // 现在我们需要将点平均分布在每个分支上
          // 思路
          // 第一个根据当前分支数量算出分支角度(第几个分支 * 平均每个分支的角度)
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          // 生成随机半径
          const distance = Math.random() * params.radius
          // 根据当前分配到哪个轴的角度，通过三角函数以及半径算出对于的z轴y轴坐标,我们需要改变z y 轴的坐标
          const current = i * 3
          // z轴
          positions[current] = Math.cos(branchAngel) * distance
          // +1 是 x轴坐标 +2 是y轴坐标
          // x轴
          positions[current + 1] = 0
          // y轴
          positions[current + 2] = Math.sin(branchAngel) * distance
          // 如此依赖就会在z轴上0到5生成随机100个点
        }

        if (props.demo === '3') {
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          const distance = Math.random() * params.radius
          const current = i * 3
          // 第三步重点在这里, 我们需要将直线变为曲线,因此可以选择增加 Math.cos的值， 值越大越旋
          // 我们可以定义多一个扭曲值rotateSacle 然后 * 点的半径，这样点距离越远则半径越大
          // z轴
          positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance
          // x轴
          positions[current + 1] = 0
          // y轴
          positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance
        }

        if (props.demo === '4') {
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          const distance = Math.random() * params.radius
          const current = i * 3
          // 第4步重点在这里, 我们需要将点分散开来，所以要分别定义一个 xyz的随机值 叠加到positions上面
          const randomX = Math.random()
          const randomY = Math.random()
          const randomZ = Math.random()
          // z轴
          positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance + randomZ
          // x轴
          positions[current + 1] = 0 + randomX
          // y轴
          positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance + randomY
        }

        if (props.demo === '5') {
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          const distance = Math.random() * params.radius
          const current = i * 3
          // 第5步重点在这里, 我们需要需要实现分支中越靠近分支轴上面的点越聚合，如果越远则越稀疏，并且我们需要分散的点上下分别在y轴原点中间
          // 思路
          // 第一随机值需要[-1, 1]之间
          // 第二我想到了3次方，这样无论正数与负数3次方可以实现值越大计算结果越大，越小计算结果越小，正好可以实现聚拢
          const randomX = (Math.random() * 2 - 1)**3
          const randomY = (Math.random() * 2 - 1)**3
          const randomZ = (Math.random() * 2 - 1)**3
          // z轴
          positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance + randomZ
          // x轴
          positions[current + 1] = 0 + randomX
          // y轴
          positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance + randomY
        }

        if (props.demo === '6') {
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          // 第6步重点在这里, 我们需要实现越靠近整个星璇的中心点越聚合，这点跟第5步有些相似，只是换了一个方向，改变的是点的半径距离
          const distance = Math.random() * (Math.random()**3 * params.radius)
          const current = i * 3
          const randomX = (Math.random() * 2 - 1)**3
          const randomY = (Math.random() * 2 - 1)**3
          const randomZ = (Math.random() * 2 - 1)**3
          // z轴
          positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance + randomZ
          // x轴
          positions[current + 1] = 0 + randomX
          // y轴
          positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance + randomY
        }

        if (props.demo === '7') {
          // 分支变为6条
          params.branch = 6
          const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)
          const distance = Math.random() * (Math.random()**3 * params.radius)
          const current = i * 3

          // 第7步重点在这里, 我们需要实现点的距离越远越靠近分支轴，因为半径最大是5 所以random的随机值应该跟半径有关，半径越大随机值越小
          const randomX = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
          const randomY = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
          const randomZ = (Math.random() * 2 - 1)**3 * ((5 - distance) / 5)
          // z轴
          positions[current] = Math.cos(branchAngel + params.rotateSacle * distance) * distance + randomZ
          // x轴
          positions[current + 1] = 0 + randomX
          // y轴
          positions[current + 2] = Math.sin(branchAngel + params.rotateSacle * distance) * distance + randomY
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      // 设置点的材质
      material = new THREE.PointsMaterial({
        color: new THREE.Color(params.color),
        // 大小
        size: params.size,
        // 尺寸(暂时不知道干嘛的)
        sizeAttenuation: true,
        // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
        depthWrite: false,
        // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
        blending: THREE.AdditiveBlending,
        // 颜色贴图
        map: textureSimpleShadow,
        // 透明贴图
        alphaMap: textureSimpleShadow,
        // 允许透明
        transparent: true,
        // 启用顶点颜色(没有geometry.setAttribute添加颜色的时候不能开启这个)
        // vertexColors: true
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
