import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import simpleShadow from './images/textures/simpleShadow.jpg'
// 寻找素材地方 https://kenney.nl/assets

// 星璇效果，功能实现思路
// 先实现一条直线的随件点

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
      count: 100,
      // 大小
      size: 0.1,
      // 半径也就是线的长度
      radius: 5,
      // 分支
      branch: 3,
      // 颜色
      color: '#ffffff'
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
        // 每3个数量为一组的第3个值，也就是z坐标
        const current = i * 3
        // z坐标上面0到5随机位置
        positions[current] = Math.random() * params.radius
        // +1 是 x轴坐标 +2 是y轴坐标
        positions[current + 1] = 0
        positions[current + 2] = 0
        // 如此依赖就会在z轴上0到5生成随机100个点
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
