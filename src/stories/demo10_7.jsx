import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个基础材质
    const geometry = new THREE.PlaneGeometry(1, 1)

    const material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide})

    // 定义一个时间
    const basicUnforms = {
      uTime: {
        value: 0
      }
    }

    // https://threejs.org/docs/index.html?q=Material#api/zh/materials/Material
    // 所有的材质都有一个onBeforeCompile ( shader : Shader, renderer : WebGLRenderer ) 方法
    // 在编译shader程序之前立即执行的可选回调。此函数使用shader源码作为参数。用于修改内置材质。
    material.onBeforeCompile = (shader, renderer) => {
      // 片元着色器 shader.fragmentShader
      // 顶点着色器 shader.vertexShader
      // 我们无法直接看到源码，这个是编译前的代码，该代码会使用#include <源码文件>引入在three内部进行字符串替换
      // 如果我们想看到真正的操作，需要到node_modules里面查看three源码，或者自行下载three源码
      // 着色器位置 node_module/three/src/renderers/shader
      /**
       *  #include <common>
          #include <uv_pars_vertex>
          #include <uv2_pars_vertex>
          #include <envmap_pars_vertex>
          #include <color_pars_vertex>
          #include <fog_pars_vertex>
          #include <morphtarget_pars_vertex>
          #include <skinning_pars_vertex>
          #include <logdepthbuf_pars_vertex>
          #include <clipping_planes_pars_vertex>
          void main() {
            #include <uv_vertex>
            #include <uv2_vertex>
            #include <color_vertex>
            #include <morphcolor_vertex>
            #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
              #include <beginnormal_vertex>
              #include <morphnormal_vertex>
              #include <skinbase_vertex>
              #include <skinnormal_vertex>
              #include <defaultnormal_vertex>
            #endif
            #include <begin_vertex>
            #include <morphtarget_vertex>
            #include <skinning_vertex>
            #include <project_vertex>
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>
            #include <worldpos_vertex>
            #include <envmap_vertex>
            #include <fog_vertex>
          }
       */

        // 我们尝试修改下顶点着色器的源码，比如改变顶点的位置
        // 翻阅源码可以得到顶点着色器#include <begin_vertex> 的源码是 vec3 transformed = vec3( position );
        // 可以知道position的变量是传给了transformed
        // 那么我们可以用js的字符串替换,来修改

        // 我们尝试传一个时间进来，做一个动画
        shader.uniforms.uTime = basicUnforms.uTime
        // 找到最顶层的源码 #include <common> 接收一个uTime变量
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          // 匹配到字符串#include <common>替换下
          `
          #include <common>
          uniform float uTime;
          `
        )

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          // 匹配到字符串#include <begin_vertex>替换下
          `
          #include <begin_vertex>
          // 根据时间来做一个简单的旋转
          transformed.x = transformed.x + sin(uTime) * 2.0;
          transformed.z = transformed.z + cos(uTime) * 2.0;
          `
        )
        console.log(shader.vertexShader)
    }

    // 生成点对象网格
    const plane = new THREE.Mesh(geometry, material)
    // 添加到场景
    scene.add(plane)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    controls.enableDamping = true


    const clock = new THREE.Clock()

    function animate () {
      // 获取时间
      const time = clock.getElapsedTime()
      basicUnforms.uTime.value = time
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
