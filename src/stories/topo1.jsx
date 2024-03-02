import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import topoFlootImg from './images/topo/topo-floot.png'

export function Demo1 (props) {
  const rootRef = useRef()

  // 创建场景
  const scene = useRef(new THREE.Scene()).current

  // 创建纹理加载器
  const textureLoader = useRef(new THREE.TextureLoader()).current

  // 定义相机变量
  const cameraRef = useRef()

  // 创建一个渲染器
  const renderer = useRef(new THREE.WebGLRenderer()).current

  // 场景里面创建一个最大的组
  const mainGroup = new THREE.Group()
  scene.add(mainGroup)

  /**
   * 生成地面函数
   * 参数
   * length 正方形长度
   * s_count: 横向数量
   * t_count：纵向数量
   */
  const createFloor = ({
    length,
    s_count,
    t_count
  }) => {
    // 加载地面纹理
    const textureTopoFloot = textureLoader.load(topoFlootImg)
    // 横向S_count个纵向T_count：纵向平铺个
    textureTopoFloot.repeat.set(s_count, t_count)
    // MirroredRepeatWrapping 镜像重复
    textureTopoFloot.wrapS = THREE.RepeatWrapping
    // RepeatWrapping普通重复
    textureTopoFloot.wrapT = THREE.RepeatWrapping
    // 创建地面材质
    const flootMaterial = new THREE.MeshBasicMaterial({
      color: '#0fdde0',
      // 透明纹理
      alphaMap: textureTopoFloot
    })
    // 开启材质透明
    flootMaterial.transparent = true
    // 添加平面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(length * s_count, length * t_count),
      flootMaterial
    )
    // 设置平面位置
    floor.position.set(0, 0, 0)
    // 设置接收阴影
    floor.receiveShadow = true
    // x轴旋转90度
    floor.rotation.x = -Math.PI / 2
    return floor
  }

  /**
   * 生成地面交叉点(粒子效果)
   * 参数
   * length 正方形长度
   * s_count: 横向数量
   * t_count：纵向数量
   */
  const createFloorPoint = ({
    length,
    s_count,
    t_count
  }) => {
    // BufferGeometry对象可以自己添加点
    const geometry = new THREE.BufferGeometry()
    // 从数学关系可知点的数量为(n1 - 1) * (n2 - 1) n1 n2 为正方形横纵行数
    const count = (s_count - 1) * (t_count - 1)
    // 定义一个数组存储
    const positions = new Float32Array(count * 3)
    // 存储随机颜色
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      // 点需要xyz 坐标所以需要 * 3
      positions[i] = (Math.random() - 0.5) * 100
    }
  }

  useEffect(() => {
    // 地面参数
    const flootParams = {
      length: 1,
      // x轴
      s_count: 50,
      // z轴
      t_count: 50
    }

    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    const camera = cameraRef.current
    window.top.camera = camera
    // 设置相机位置根据地面宽高来
    camera.position.set(flootParams.s_count, 25, flootParams.t_count)
    // 加载地面
    const floor = createFloor({
      length: flootParams.length,
      s_count: flootParams.s_count,
      t_count: flootParams.t_count
    })
    // 放到mainGroup
    mainGroup.add(floor)
    // 设置mainGroup的位置
    mainGroup.position.set(-(flootParams.s_count / 2), 0, -(flootParams.t_count / 2))
    // 加载地面交叉的点
    createFloorPoint({
      length: flootParams.length,
      s_count: flootParams.s_count,
      t_count: flootParams.t_count
    })

    const geometry = new THREE.SphereGeometry( 1, 20, 20 )
    // 创建基础材质
    const material = new THREE.MeshBasicMaterial()
    // 生成网格
    const cube = new THREE.Mesh( geometry, material )

    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)

    // 设置控制器的阻尼,必须在动画调用update
    controls.enableDamping = true
    function animate () {
      // 开启阻尼需要update
      controls.update()
      requestAnimationFrame( animate )
      renderer.render(scene, camera)
    }
    animate()
    // 辅助线
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
