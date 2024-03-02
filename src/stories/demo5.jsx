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

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 )
    // 平行光需要给光源设置一个位置
    directionalLight.position.set(10, 10, 10)
    // 开启投射阴影
    directionalLight.castShadow = true
    // 设置阴影模糊度
    if (props.setShadowRadius) {
      directionalLight.shadow.radius = 20
      // 开启模糊度默认阴影分辨率是512，添加gui调节
      // 修改分辨率， 默认为512会模糊，分辨率值越高越逼真
      directionalLight.shadow.mapSize.set(2048, 2048)

      // 设置平行光投射相机的属性
      // 近端
      directionalLight.shadow.camera.near = 0.5
      // 远端
      directionalLight.shadow.camera.far = 500
      directionalLight.shadow.camera.top = 5
      directionalLight.shadow.camera.bottom = -5
      directionalLight.shadow.camera.left = -5
      directionalLight.shadow.camera.right = 5
      gui.add(directionalLight.shadow.camera, 'near')
        .min(directionalLight.shadow.camera.near)
        .max(20).step(0.1)
        .name('近端距离')
        .onChange(() => {
          // 更新摄像机投影矩阵
          directionalLight.shadow.camera.updateProjectionMatrix()
        })
    }
    scene.add(directionalLight)

    // 添加平面
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
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
