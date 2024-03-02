import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 添加gui
    const gui = new dat.GUI()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个圆球几何体
    // 1位半径
    const geometry = new THREE.SphereGeometry( 1, 20, 20 )
    // 通过BufferGeometry来创建
    // 将顶点信息添加到BufferGeometry的position属性中
    // itemSize = 3 因为每个顶点都是一个三元组
    // 创建标准材质
    const material = new THREE.MeshStandardMaterial()
    // 生成网格
    const cube = new THREE.Mesh( geometry, material )
    // 设置投射阴影
    cube.castShadow = true
    // 添加到场景
    scene.add(cube)

    // 添加环境光
    // 第二个参数为光的强度
    const light = new THREE.AmbientLight( '#ffffff', 0.5) // soft white light
    scene.add( light )

    // 添加点光源
    // 聚光灯可以把光聚焦到某个物体上,光辉随着物体移动
    const directionalLight = new THREE.PointLight( 0xffffff, 0.5 )
    // 开启投射阴影
    directionalLight.castShadow = true
    // 设置模糊度
    directionalLight.shadow.radius = 20
    // 开启模糊度默认阴影分辨率是512，添加gui调节
    // 修改分辨率， 默认为512会模糊，分辨率值越高越逼真
    directionalLight.shadow.mapSize.set(1000, 1000)

    // 需要创建一个球体，然后将点光源添加到球体上面
    const amallBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 20, 20),
      // 材质应该为基础材质，这样才不会受光的影响
      new THREE.MeshBasicMaterial({color: 0xffffff})
    )
    // 设置球体的位置
    amallBall.position.set(2, 2, 2)
    // 将点光源添加进球体
    amallBall.add(directionalLight)

    gui.add(amallBall.position, 'x')
      .min(-5)
      .max(5).step(0.1)
      .name('光源球体x轴位置')

    // 从光源发出光的最大距离，其强度根据光源的距离线性衰减(直白点说就是光能照多远, 默认是0最不衰减)
    gui.add(directionalLight, 'distance')
      .min(0)
      .max(100).step(0.1)
      .name('光的距离')

    if (props.physicallyCorrectLights) {
      // 沿着光照距离的衰减量(真实物理衰减 值为2的时候就是接近显示中的衰减)
      // In context of physically-correct rendering the default value should not be changed.
      // 在 physically-correct 模式下才能生效,需要设置渲染器 renderer.physicallyCorrectLights = true
      gui.add(directionalLight, 'decay')
      .min(0)
      .max(5).step(0.1)
      .name('沿着光照距离的衰减量')
    }

    // 将点光源所添加的球体添加到场景
    scene.add(amallBall)

    // 添加平面
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      material
    )
    // 设置平面位置
    plane.position.set(0, -1, 0)
    // 设置接收阴影
    plane.receiveShadow = true
    // x轴旋转90度
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    // 添加阴影
    if (props.setShadow) {
      // 需要满足以下条件
      // 1.材质需要满足能够对光照有反应，（标准材质具备）
      // 2. 设置渲染器开启阴影的计算 renderer.shadowMap.enabled = true
      // 3.设置光照投射阴影 directionalLight.castShadow = true
      // 4.设置球形物体投射阴影 cube.castShadow = true
      // 5 设置平面物体接收阴影 plane.receiveShadow = true
    }

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 开启阴影计算
    if (props.setShadow) {
      renderer.shadowMap.enabled = true
    }
    // 开启物理模式
    if (props.physicallyCorrectLights) {
      renderer.physicallyCorrectLights = true
    }

    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    if (props.enableDamping) {
      controls.enableDamping = true
    }

    // 设置时钟
    const clock = new THREE.Clock()

    function animate () {
      // 设置旋转动画
      if (props.spotAnimation) {
        const time = clock.getElapsedTime()
        // 通过时间不断改变光源球体的位置
        amallBall.position.x = Math.sin(time) * 3
        amallBall.position.z = Math.cos(time) * 3
        // 改变y轴，达到上下浮动
        amallBall.position.y = 2 + Math.sin(time) * 3
      }

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
