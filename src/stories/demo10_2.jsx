import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 波浪着色器顶点
import { Uniform } from 'three'
import waveVertexShader from '../shader/wave/wave1.vt.glsl'
// 波浪片元着色器
import wavefragmentShader from '../shader/wave/wave1.fs.glsl'

// 波浪着色器顶点2
import wave2VertexShader from '../shader/wave/wave2.vt.glsl'
// 波浪片元着色器2
import wave2fragmentShader from '../shader/wave/wave2.fs.glsl'

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
    const geometry = new THREE.PlaneGeometry( 1, 1, 400, 400)
    // 创建着色器材质
    // 着色器可以让我们自己编写顶点着色器代码跟片元着色器代码

    let vertexShader = ''
    let fragmentShader = ''

    // 是否是原始着色器材质
    let material = null
    switch (props.demo) {
      case '1':
        vertexShader = waveVertexShader
        fragmentShader = wavefragmentShader
        break
      case '2':
        vertexShader = wave2VertexShader
        fragmentShader = wave2fragmentShader
        break
    }

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 加载图片
    const mgwlImg = textureLoader.load(require('./images/textures/mgwl.jpg'))

    material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      // 开启双面
      side: THREE.DoubleSide,
      // 传入变量给shader
      uniforms: {
        // 传入一个时间,在动画那里改变时间
        uTime: {
          value: 0
        },
        // 传入一张图片
        uTexture: {
          value: mgwlImg
        }
      }
    })

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

    // 设置时钟
    const clock = new THREE.Clock()

    function animate () {
      // 获取时间
      const time = clock.getElapsedTime()
      // 改变传入着色器的时间变量
      material.uniforms.uTime.value = time
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
