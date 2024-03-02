import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()


    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个正方形物体
    const geometry = new THREE.BoxGeometry()
    const cubeColor =  '#00ff00'
    // 创建材质
    const material = new THREE.MeshBasicMaterial( { color: cubeColor } )
    // 生成网格
    const cube = new THREE.Mesh( geometry, material )
    // 添加到场景
    scene.add(cube)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )

    // 自动旋转
    if (props.demo === '1') {
      // 调用浏览器帧定时器，实时渲染场景
      function animate () {
        // 不断改变物体角度使立方体动起来
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        requestAnimationFrame( animate )
        renderer.render( scene, camera )
      }
      animate()
    }

    // gsap动画
    if (props.gsapTo) {
      // 物体位置动画
      gsap.to(cube.position, {
        // x变为5
        x: 5,
        ease: 'back.out(1.7)',
        // 重复次数2次, -1 为无数次
        repeat: -1,
        // 往返云顶
        yoyo: true,
        // 延迟2秒
        delay: 2,
        // 花5秒
        duration: 5,
        onStart: () => {
          console.log('动画开始')
        },
        onComplete: () => {
          console.log('动画完成, 如果是无限循环的话不会调用')
        }
      })
      // 物体旋转动画
      gsap.to(cube.rotation, {
        // x变为5
        x: Math.PI * 2,
        // 花5秒
        duration: 5
      })
    }

    // 添加轨道控制器
    if (props.demo === '2') {
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
    }

    if (props.helper === true) {
      const axesHelper = new THREE.AxesHelper( 5 )
      scene.add( axesHelper )
    }

    // 设置物体的位置
    if (props.meshPosition) {
      cube.position.set(...props.meshPosition)
    }

    // 设置物体的缩放
    if (props.meshScale) {
      cube.scale.set(...props.meshScale)
    }

    // 设置物体的旋转
    if (props.meshRotation) {
      cube.rotation.set(...props.meshRotation)
    }

    // 监听页面变化，更新渲染画面
    if (props.resizeListener) {
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
    }

    // 添加双击进入全屏跟退出全屏
    if (props.fullScreen) {
      window.addEventListener('dblclick', () => {
        const {fullscreenElement} = document
        if (!fullscreenElement) {
          renderer.domElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      })
    }

    // 使用dat.git调试变量
    if (props.datGui) {
      const gui = new dat.GUI()
      gui.add(cube.position, 'x').min(0).max(5).step(0.01).name('移动x轴').onChange((value) => {
        console.log('值被修改了', value)
      }).onFinishChange(() => {
        console.log('值修改结束')
      })
      // 修改物体的颜色
      const params = {
        color: cubeColor,
        fn: () => {
          gsap.to(cube.position, { x: 5, duration: 2, yoyo: true, repeat: -1 })
        }
      }
      gui.addColor(params, 'color').name('颜色').onChange((value) => {
        console.log('颜色被修改')
        cube.material.color.set(value)
      })
      // 设置显示隐藏
      gui.add(cube, 'visible').name('是否显示')
      // 点击出发某个事件
      gui.add(params, 'fn').name('让物体运动起来')
      // 添加文件夹
      const folder = gui.addFolder('设置立方体')
      // 是否显示线框
      folder.add(cube.material, 'wireframe').name('线框')
    }
  }, [])

  return <div style={{width: '100%', height: '600px'}}>
    <div ref={rootRef} style={{width: '100%', height: '100%'}} />
  </div>
}
