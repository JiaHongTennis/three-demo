import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入顶点着色器
import basicVertexShader from '../shader/basic/vertex.vt.glsl'
// 导入片元着色器
import basicFragmentShader from '../shader/basic/fragment.fs.glsl'
// 导入原始顶点着色器材质
import rowBasicVertexShader from '../shader/rowbasic/vertex.vt.glsl'
// 导入原始片元着色器
import rowBasicFragmentShader from '../shader/rowbasic/fragment.fs.glsl'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个平面几何体
    const geometry = new THREE.PlaneGeometry( 1, 1 )
    // 创建着色器材质
    // 着色器可以让我们自己编写顶点着色器代码跟片元着色器代码

    let vertexShader = ''
    let fragmentShader = ''

    // 是否是原始着色器材质
    let material = null
    if (props.isRow) {
      vertexShader = rowBasicVertexShader
      fragmentShader = rowBasicFragmentShader
      material = new THREE.RawShaderMaterial( {
        vertexShader,
        fragmentShader
      } )
    } else {
      vertexShader = basicVertexShader
      fragmentShader = basicFragmentShader
      material = new THREE.ShaderMaterial( {
        vertexShader,
        fragmentShader
    } )
    }

    // 生成网格
    const cube = new THREE.Mesh(geometry, material)
    // 添加到场景
    scene.add(cube)

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
