import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CANNON from 'cannon-es'
import pzAudiomp3 from './assets/pz.mp3'

// CANNON 就是物理引擎

export function Demo1 (props) {
  const rootRef = useRef()
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

    // 生成圆球
    const geometry = new THREE.SphereGeometry( 1, 20, 20 )
    const material = new THREE.MeshStandardMaterial()
    const cube = new THREE.Mesh( geometry, material )
    // 设置投射阴影
    cube.castShadow = true
    // 设置球的位置
    cube.position.y = 5
    // 添加到场景
    scene.add(cube)

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

    // 重点
    // 物理引擎犹如一个物理的世界，物理世界是自己的一个物理引擎，负责计算物理性质
    // three是一个渲染引擎，负责画画
    // 我们需要在物理世界创建出一个同样位置同样大小的球体，然后给球体设置重力，通过物理引擎可以计算出球的实时位置
    // 然后通过three实时的拿到这个位置，并更新界面我们看到的球的位置

    // 创建一个物理世界
    const world = new CANNON.World()
    // 设置世界的重力为9.8(伽利略的重力加速度)y轴, 因为y轴向上是正所以重力是-9.8
    world.gravity.set(0, -9.8, 0)
    // 创建物理世界的的形状，小球半径是1
    const sphereShage = new CANNON.Sphere(1)
    // 创建物理世界的材质,不传为默认材质
    // 小球材质,参数应该是别名的意思
    const sphereWorldMaterial = new CANNON.Material('sphere')
    // 平面材质,参数应该是别名的意思
    const floorWorldMaterial = new CANNON.Material('floor')

    // 创建物理世界的物体
    const sphereBody = new CANNON.Body({
      // 形状(小球)
      shape: sphereShage,
      // 物体的位置跟three的小球重合
      position: new CANNON.Vec3(0, 10, 0),
      // 小球的质量
      mass: 1,
      // 设置物体的材质
      material: sphereWorldMaterial
    })
    // 将物体添加至物理世界,然后物理世界就拥有了一个球
    world.addBody(sphereBody)
    // 物理世界的球受重力影响，然后需要实时获取位置
    // world.step()

    if (props.demo === '2') {
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
    }

    // 创建碰撞声音
    const pzAudio = new Audio(pzAudiomp3)
    if (props.voice === true) {
      // 添加监听碰撞的事件
      const HitEvent = (e) => {
        console.log('碰撞了')
        // 获取碰撞强度
        const ImpactVelocityAlongNormal = e.contact.getImpactVelocityAlongNormal()
        // 播放声音,基于浏览器的限制，声音必须要用户有交互的时候play才能成功调用,否者不会有声音
        // 没有交互的时候会报 Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document firs
        // 当力度大于2的时候才发出声音
        if (ImpactVelocityAlongNormal > 2) {
          // 如果再次碰撞需要把时间从新回到原点，否者有可能碰撞频率过快导致上一个声音还没播放完，导致下一个声音播放不出来
          pzAudio.currentTime = 0
          pzAudio.play()
        }
      }
      sphereBody.addEventListener('collide', HitEvent)
    }

    // 调整物体碰撞的系数
    if (props.contactMaterial) {
      // 如果想调整物体之间的碰撞，比如增大弹力或者摩擦力之类的，需要关联属性，然后再添加到物理世界
      // 关联下小球跟平面的材质，并设置系数
      const defaultContactMaterial = new CANNON.ContactMaterial(
        sphereWorldMaterial,
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
      // animate函数调用之后跟上一帧的时间差
      const deltaTime = clock.getDelta()

      // 更新物理引擎里世界的位置
      // 注意world.step的第一个参数相当于第几秒的位置,因为电脑通常是60帧，所以1秒会刷新60次，也就是说大概率情况下animate1秒内会调用60次，所以每次只更新(1/60)是最接近现实世界的
      // 第二个参数是时间差这个时间差，猜测大概率内部会根据时间差实时调节，让计算结果更加精确
      world.step(1 / 60, deltaTime)
      cube.position.copy(sphereBody.position)

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
