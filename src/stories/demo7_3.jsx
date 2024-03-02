import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import simpleShadow from './images/textures/simpleShadow.jpg'
import xhimg from './images/textures/xh.jpeg'
// 寻找素材地方 https://kenney.nl/assets

// 雪花效果，功能实现
// 让物体围绕x轴做旋转 （注意摄像机距离稍微要远一点）
// 将代码生成随机点的方法封装成函数，这样可以创建多钟类型的图片雪花
// 然后设置摄像头的最远距离，把旋转产生的上手的点给隐藏掉

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()

    // 生成雪花函数， 返回点对象
    const createPoints = (img, size = 0.5) => {
      // 添加纹理贴图
      const textureSimpleShadow = textureLoader.load(img)
      // 雪花效果的原理-需要创建一个随机的点，我们定义5000个点
      // BufferGeometry对象可以自己添加点
      const geometry = new THREE.BufferGeometry()
      // 添加随机顶点
      const count = 5000
      // 定义一个数组存储
      const positions = new Float32Array(count * 3)
      // 存储随机颜色
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count * 3; i++) {
        // 点需要xyz 坐标所以需要 * 3
        positions[i] = (Math.random() - 0.5) * 100
        colors[i] = Math.random()
      }
      // 添加到Buffer对象中
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      // 添加颜色信息,需要设置材质启用顶点颜色 pointsMaterial.vertexColors = true
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      // 需要创建一个点的材质
      const pointsMaterial = new THREE.PointsMaterial({
        color: '#ffff00'
      })
      // 设置点材质大小
      pointsMaterial.size = size
      // 添加颜色贴图
      pointsMaterial.map = textureSimpleShadow
      // 这样的话图片黑色的地方不是透明的，所以要添加透明贴图
      pointsMaterial.alphaMap = textureSimpleShadow
      // 允许透明
      pointsMaterial.transparent = true
      // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
      pointsMaterial.depthWrite = false
      // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
      pointsMaterial.blending = THREE.AdditiveBlending
      // 启用顶点暗色
      pointsMaterial.vertexColors = true

      // 创建点对象
      const points = new THREE.Points(geometry, pointsMaterial)
      // 点对象添加到场景
      scene.add(points)

      return points
    }

    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 40 )
    // 设置相机位置
    camera.position.set(0, 0, 50)

    // 生成雪花
    const points1 = createPoints(simpleShadow)
    // 生成第2钟类型的雪花
    const points2 = createPoints(xhimg, 1)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()

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
      // 雪花效果，让物体围绕着x轴旋转
      points1.rotation.x = time * 0.3
      points2.rotation.x = time * 0.3
      // y轴旋转
      points1.rotation.y = time * 0.03
      points2.rotation.y = time * 0.03
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
