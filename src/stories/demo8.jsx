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
    camera.position.z = 10

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()

    // 生成1000个正方体
    // 创建正方体几何体以及材质
    // 定义cubArr保存对象用来做射线查询
    const cubArr = []
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      // 显示为线框
      wireframe: true
    })
    const redMaterial = new THREE.MeshBasicMaterial({
      color: '#ff0000'
    })

    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        for (let z = -5; z < 5; z++) {
          const cube = new THREE.Mesh(cubeGeometry, material)
          cube.position.set(i, j, z)
          scene.add(cube)
          cubArr.push(cube)
        }
      }
    }

    // 重点: 投射光线
    // 创建投射光线
    const raycaster = new THREE.Raycaster()

    // three本身没有事件，所以需要用到js原始的事件，拿到当前屏幕坐标，通过投射光线获取到操作的对象
    // 定义一个对象保存当前鼠标位置

    // 定义一个二维向量保存鼠标位置
    const mouse = new THREE.Vector2()
    // 鼠标移动监听
    rootRef.current.addEventListener('mousemove', (event) => {
      // offsetX offsetY是去掉内边距的位置
      // 射线是 中间点是00 x轴向右是正 y轴向下是正数， 整个屏幕是[-1, 1] 从左往右 从上往下
      // 因此
      mouse.x = (event.offsetX / rootRef.current.offsetWidth) * 2 - 1
      // y轴由于向下是正数，所以向上应该取反
      mouse.y = -((event.offsetY/ rootRef.current.offsetHeight) * 2 - 1)
      // 拿到当前的鼠标位置,然后更显射线的位置
      raycaster.setFromCamera(mouse, camera)
      // 调用射线查询当前物体对象，返回射线经过的所有的物体, 需要传入查询对象
      const result = raycaster.intersectObjects(cubArr)
      if (result.length > 0) {
        console.log(result)
      }
    })

    // 点击事件
    rootRef.current.addEventListener('click', (event) => {
      // 调用射线查询
      const result = raycaster.intersectObjects(cubArr)
      if (result.length > 0) {
        // 证明点击到物体, 那么第一个替换材质变成红色
        result[0].object.material = redMaterial
      }
    })

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
