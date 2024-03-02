import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// demo1顶点
import demo1VtShader from '../shader/pointShader/demo1/demo1.vt.glsl'
// demo1片元
import demo1FsShader from '../shader/pointShader/demo1/demo1.fs.glsl'
// demo2顶点
import demo2VtShader from '../shader/pointShader/demo2/demo2.vt.glsl'
// demo2片元
import demo2FsShader from '../shader/pointShader/demo2/demo2.fs.glsl'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 加载图片
    const mgwlImg = textureLoader.load(require('./images/textures/simpleShadow.jpg'))

    // BufferGeometry对象可以自己添加点
    const geometry = new THREE.BufferGeometry()
    // 定义一个数组存储
    const positions = new Float32Array([0, 0, 0])
    // 添加到Buffer对象中
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    // 创建着色器材质

    let vertexShader = ''
    let fragmentShader = ''

    // 原始着色器材质
    if (props.demo === '1') {
      vertexShader = demo1VtShader
      fragmentShader = demo1FsShader
    }
    if (props.demo === '2') {
      vertexShader = demo2VtShader
      fragmentShader = demo2FsShader
    }
    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      // 传入一张图片
      uniforms: {
        uTexture: {
          value: mgwlImg
        },
      },
      transparent: true
    })


    // 生成点对象网格
    const point = new THREE.Points(geometry, material)
    // 添加到场景
    scene.add(point)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    controls.enableDamping = true
    function animate () {
      // 开启阻尼
      controls.update()
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
