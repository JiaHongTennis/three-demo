import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import simpleShadow from './images/textures/simpleShadow.jpg'
// 寻找素材地方 https://kenney.nl/assets

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 添加gui
    const gui = new dat.GUI()

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 添加纹理贴图
    const textureSimpleShadow = textureLoader.load(simpleShadow)

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5
    // 创建一个圆球几何体
    // 1位半径
    const geometry = new THREE.SphereGeometry( 3, 20, 20 )
    // 需要创建一个点的材质
    const pointsMaterial = new THREE.PointsMaterial({
      color: '#ffff00'
    })
    // 设置点材质大小
    pointsMaterial.size = 0.1
    // 添加颜色贴图
    if (props.addImg) {
      pointsMaterial.map = textureSimpleShadow
      // 这样的话图片黑色的地方不是透明的，所以要添加透明贴图
      pointsMaterial.alphaMap = textureSimpleShadow
      // 允许透明
      pointsMaterial.transparent = true
      // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
      pointsMaterial.depthWrite = false
      // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
      pointsMaterial.blending = THREE.AdditiveBlending
    }
    // 创建点对象
    const points = new THREE.Points(geometry, pointsMaterial)
    // 点对象添加到场景
    scene.add(points)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()

    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    if (props.enableDamping) {
      controls.enableDamping = true
    }
    function animate () {
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
