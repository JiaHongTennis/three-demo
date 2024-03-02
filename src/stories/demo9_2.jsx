import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CANNON from 'cannon-es'
import pzAudiomp3 from './assets/pz.mp3'
import { useIntensityDirection } from '../hooks/useIntensityDirection'

// CANNON 就是物理引擎

export function Demo1 (props) {
  const rootRef = useRef()
  // 注册方向键按下事件
  const { intensity, direction } = useIntensityDirection()
  const intensityRef = useRef()
  const directionRef = useRef()
  intensityRef.current = intensity
  directionRef.current = direction
  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 20

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 开启渲染器阴影计算
    renderer.shadowMap.enabled = true

    // 添加环境光
    // 第二个参数为光的强度
    const light = new THREE.AmbientLight( '#ffffff', 0.5) // soft white light
    scene.add( light )

    // three的材质
    const material = new THREE.MeshStandardMaterial()

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

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )
    // 平行光需要给光源设置一个位置
    directionalLight.position.set(0, 10, 0)
    // 开启投射阴影
    directionalLight.castShadow = true
    // 设置阴影模糊度
    directionalLight.shadow.radius = 20
    // 开启模糊度默认阴影分辨率是512，添加gui调节
    // 修改分辨率， 默认为512会模糊，分辨率值越高越逼真
    directionalLight.shadow.mapSize.set(2048, 2048)
    scene.add(directionalLight)

    // 创建一个物理世界
    const world = new CANNON.World()
    // 设置世界的重力为9.8(伽利略的重力加速度)y轴, 因为y轴向上是正所以重力是-9.8
    world.gravity.set(0, -9.8, 0)
    // 创建物理世界的的形状，正方体半径是1,注意正方体这个三维向量宽度需要写一半，也就是说宽度为1,Vue3 则是0.5
    const cubeShage = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
    // 创建物理世界的材质,不传为默认材质
    // 正方体材质,参数应该是别名的意思
    const cubeWorldMaterial = new CANNON.Material('cube')
    // 平面材质,参数应该是别名的意思
    const floorWorldMaterial = new CANNON.Material('floor')

    // 重点
    // 我们需要实现一个点击落下正方体的功能，所以我们需要一个创建正方体的函数，会生成物理世界正方体以及three正方体

    // 创建碰撞声音
    const pzAudio = new Audio(pzAudiomp3)
    // 创建一个数组保存生成的正方体
    const cubeArr = []
    const createCube = () => {
      // 生成正方体，并且添加到场景里面
      const geometry = new THREE.BoxGeometry( 1, 1, 1 )
      const cube = new THREE.Mesh( geometry, material )
      // 设置投射阴影
      cube.castShadow = true
      // 设置球的位置
      cube.position.y = 5
      // 添加到场景
      scene.add(cube)

      // 生成物理世界正方体
      const cubeBody = new CANNON.Body({
        // 形状(正方体)
        shape: cubeShage,
        // 物体的位置跟three的正方体重合
        position: new CANNON.Vec3(0, 10, 0),
        // 小球的质量
        mass: 1,
        // 设置物体的材质
        material: cubeWorldMaterial
      })

      if (props.direction) {
        // 给物体一个方向的力,根据键盘来
        // 根据方向来定义一个物理世界力的方向
        if (intensityRef.current > 0) {
          const directionvec3Arr = [0, 0, 0]
          if (directionRef.current === 'top') {
            // z轴为负
            directionvec3Arr[2] = -intensityRef.current * 8
          }
          if (directionRef.current === 'bottom') {
            // z轴为正
            directionvec3Arr[2] = intensityRef.current * 8
          }
          if (directionRef.current === 'left') {
            // x轴为负
            directionvec3Arr[0] = -intensityRef.current * 8
          }
          if (directionRef.current === 'right') {
            // x轴为正
            directionvec3Arr[0] = intensityRef.current * 8
          }
          console.log(directionvec3Arr)
          cubeBody.applyLocalForce(
            // 力的大小和方向
            new CANNON.Vec3(directionvec3Arr[0], directionvec3Arr[1], directionvec3Arr[2]),
            // 力作用的点
            new CANNON.Vec3(0, 0, 0)
          )
        }
      }

      // 将物体添加至物理世界,然后物理世界就拥有了一个球
      world.addBody(cubeBody)
      // 添加监听碰撞的事件
      const HitEvent = (e) => {
        // 获取碰撞强度
        const ImpactVelocityAlongNormal = e.contact.getImpactVelocityAlongNormal()
        // 播放声音,基于浏览器的限制，声音必须要用户有交互的时候play才能成功调用,否者不会有声音
        // 没有交互的时候会报 Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document firs
        // 当力度大于2的时候才发出声音
        if (ImpactVelocityAlongNormal > 2) {
          // 如果再次碰撞需要把时间从新回到原点，否者有可能碰撞频率过快导致上一个声音还没播放完，导致下一个声音播放不出来
          // 我们需要根据碰撞的力度来调节声音的大小
          // 根据经验值告诉我们碰撞的力度通常在0~12之间
          // 调节音量的值是0~1
          // 我们可以根据力度/12得出当前的音量大小，需要注意的值12最大只是一个经验值，而调节音量值如果大于1就会保存所以需要判断一下
          let yl = ImpactVelocityAlongNormal / 12
          // 判断音量不超过1
          yl = yl > 1 ? 1 : yl
          pzAudio.volume = yl
          pzAudio.currentTime = 0
          pzAudio.play()
        }
      }
      cubeBody.addEventListener('collide', HitEvent)
      // 保存到数组，方便外面three获取物理世界的位置，实时更新
      cubeArr.push({
        // three 物体
        mesh: cube,
        // 物理世界物体
        word: cubeBody
      })
    }

    // 添加点击事件监听,每次点击就生成一个正方体
    rootRef.current.addEventListener('click', createCube)

    // 要想让地面碰到，就需要在物理世界中创建地面
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body({
      // 形状为平面
      shape: floorShape,
      // 平面的位置
      position: new CANNON.Vec3(0, -1, 0),
      // 地面的质量,当质量为0的时候可以使物体保持不动
      mass: 0,
      // 设置物体的材质
      material: floorWorldMaterial
    })
    // 旋转第一个参数是x轴，第二个参数是角度
    // 注意角度必须是-90 跟three这个角度这样平面才是正面，否者出不了效果
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // 加入物理世界
    world.addBody(floorBody)

    // 调整物体碰撞的系数
    // 如果想调整物体之间的碰撞，比如增大弹力或者摩擦力之类的，需要关联属性，然后再添加到物理世界
    // 关联下小球跟平面的材质，并设置系数
    const defaultContactMaterial = new CANNON.ContactMaterial(
      cubeWorldMaterial,
      floorWorldMaterial,
      {
        // 摩擦力
        friction: 0.3,
        // 弹力
        restitution: 0.5
      }
    )
    // 添加到物理世界注意方法是addContactMaterial,因为这是添加关联材质不是addBody
    world.addContactMaterial(defaultContactMaterial)

    // 也可以给世界设置一个默认的碰撞材料，如果材料没有设置都用这个
    world.defaultContactMaterial = defaultContactMaterial

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
      // animate函数调用之后跟上一帧的时间差
      const deltaTime = clock.getDelta()

      // 更新物理引擎里世界的位置
      // 注意world.step的第一个参数相当于第几秒的位置,因为电脑通常是60帧，所以1秒会刷新60次，也就是说大概率情况下animate1秒内会调用60次，所以每次只更新(1/60)是最接近现实世界的
      // 第二个参数是时间差这个时间差，猜测大概率内部会根据时间差实时调节，让计算结果更加精确
      world.step(1 / 60, deltaTime)
      // 循环物体更新位置
      cubeArr.forEach(item => {
        item.mesh.position.copy(item.word.position)
        // 设置渲染的物体跟随物理世界物体旋转
        // 物理世界的旋转就是四元素,所以需要复制一下四元素
        item.mesh.quaternion.copy(item.word.quaternion)
      })

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

  return <div style={{width: '100%', height: '600px', position: 'relative'}}>
    {
      props.direction ? (
        <div style={{
          position: 'absolute',
          bottom: '150px',
          right: '150px',
          color: '#fff',
          zIndex: '2',
          background: '#ccc',
          width: '0px',
          height: '0px'
          }}>
        {/* 上边 */}
        <div style={{width: '10px', height: '100px', position: 'absolute', bottom: '10px', background: '#ccc', borderRadius: '10px', overflow: 'hidden'}}>
          <div style={{
              width: '100%',
              height: `${direction === 'top' ? intensity : 0}%`,
              backgroundColor: 'green',
              position: 'absolute',
              bottom: 0,
              left: 0
              }} />
        </div>
        {/* 下边 */}
        <div style={{width: '10px', height: '100px', position: 'absolute', top: '10px', background: '#ccc', borderRadius: '10px', overflow: 'hidden'}}>
          <div style={{
            width: '100%',
            height: `${direction === 'bottom' ? intensity : 0}%`,
            backgroundColor: 'green',
            position: 'absolute',
            top: 0,
            left: 0
            }} />
        </div>
        {/* 左边 */}
        <div style={{width: '100px', height: '10px', position: 'absolute', right: '10px', background: '#ccc', borderRadius: '10px', overflow: 'hidden'}}>
          <div
            style={{
              width: `${direction === 'left' ? intensity : 0}%`,
              height: '100%',
              backgroundColor: 'green',
              position: 'absolute',
              top: 0,
              right: 0
              }} />
        </div>
        {/* 右边 */}
        <div style={{width: '100px', height: '10px', position: 'absolute', left: '10px', background: '#ccc', borderRadius: '10px', overflow: 'hidden'}}>
          <div
            style={{
              width: `${direction === 'right' ? intensity : 0}%`,
              height: '100%',
              backgroundColor: 'green',
              position: 'absolute',
              top: 0,
              left: 0
              }} />
        </div>
      </div>
      ) : ''
    }
    <div ref={rootRef} style={{width: '100%', height: '100%'}} />
  </div>
}
