import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入css2d渲染器跟css2d对象
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import '../css/demo11.css'

export function Demo1 (props) {
  const rootRef = useRef()

  /**
   * 经纬度转xyz
   * @param lng 经度
   * @param lat 纬度
   * @param radius 半径
   */
  const lglt2xyz = (lng, lat, radius) => {
    const phi = (90-lat)*(Math.PI/180)
        const theta = (lng+180)*(Math.PI/180)
        const x = -(radius * Math.sin(phi) * Math.cos(theta))
        const z = (radius * Math.sin(phi) * Math.sin(theta))
        const y = (radius * Math.cos(phi))
    return {x, y, z}
  }

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.set(0, 0, 2)

    // 灯光
    const dirLight = new THREE.AmbientLight( 0xffffff )
    dirLight.position.set( 0, 0, 2 )
    dirLight.layers.enableAll()
    scene.add( dirLight )

    // 纹理加载器
    const textureLoader = new THREE.TextureLoader()

    // 定义半径
    const EARTH_RADIUS = 1
    const MOON_RADIUS = 0.27

    // 地球
    const earthGeometry = new THREE.SphereGeometry( EARTH_RADIUS, 16, 16 )
    const earthMaterial = new THREE.MeshPhongMaterial( {
      specular: 0x333333,
      shininess: 5,
      map: textureLoader.load(require('./images/textures/planets/earth_atmos_2048.jpg')),
      specularMap: textureLoader.load(require('./images/textures/planets/earth_specular_2048.jpg')),
      normalMap: textureLoader.load(require('./images/textures/planets/earth_normal_2048.jpg')),
      normalScale: new THREE.Vector2( 0.85, 0.85 )
    } )
    const earth = new THREE.Mesh( earthGeometry, earthMaterial )
    scene.add(earth)

    // 地球上贴着标签
    // 创建一个标签
    const earthDiv = document.createElement('div')
    earthDiv.className = 'label'
    earthDiv.innerHTML = '地球'
    // 创建css2d对象
    const earthLabel = new CSS2DObject(earthDiv)
    // 设置css2d对象的位置
    earthLabel.position.set(0, EARTH_RADIUS, 0)
    // 添加到地球里面,坐标是根据地球来的
    earth.add(earthLabel)
    // 我们创建完对象，如果要显示还需要对应的css渲染器CSS2DRenderer

    // 我们想要绘制一个中国的地图的标签
    // 根据经纬度得到xyz坐标,这个点大约是在浙江左右吧
    const chinaxyz = lglt2xyz(120, 30, 1)
    const chinaDiv = document.createElement('div')
    chinaDiv.className = 'label'
    chinaDiv.innerHTML = '中国'
    // 创建css2d对象
    const chinaLabel = new CSS2DObject(chinaDiv)
    chinaLabel.position.set(chinaxyz.x, chinaxyz.y, chinaxyz.z)
    earth.add(chinaLabel)

    // 文字在地球的背面隐藏，我们可以利用光线投射来检查，文字是否在地球的前面
    // 创建射线
    const raycaster = new THREE.Raycaster()

    // 月亮
    const moonGeometry = new THREE.SphereGeometry( MOON_RADIUS, 16, 16 )
    const moonMaterial = new THREE.MeshPhongMaterial( {
      shininess: 5,
      map: textureLoader.load(require('./images/textures/planets/moon_1024.jpg'))
    } )
    const moon = new THREE.Mesh( moonGeometry, moonMaterial )
    scene.add(moon)

    const moonDiv = document.createElement('div')
    moonDiv.className = 'label'
    moonDiv.innerHTML = '月球'
    // 创建css2d对象
    const moonLabel = new CSS2DObject(moonDiv)
    // 设置css2d对象的位置
    moonLabel.position.set(0, MOON_RADIUS, 0)
    // 添加到地球里面,坐标是根据地球来的
    moon.add(moonLabel)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 创建css2d渲染器
    const labelRenderer = new CSS2DRenderer()
    // 设置渲染画布大小
    labelRenderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( labelRenderer.domElement )
    // 让2d渲染器的div跟webgl渲染器重合并且叠加在上面
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.left = '0'
    labelRenderer.domElement.style.zIndex = '10'


    // 添加轨道控制器,2d渲染器盖在上面所以用2d渲染器来控制
    const controls = new OrbitControls(camera, labelRenderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    controls.enableDamping = true

    // 创建时钟
    const clock = new THREE.Clock()

    function animate () {
      // 获取当前时间
      const elapsed = clock.getElapsedTime()

      // 首先我们要知道文字所在的空间对应的相机的屏幕坐标xy
      // 使用vector3中的,project可以将此向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间
      // 也就是xy坐标会变成摄像机的屏幕坐标
      // 先克隆一个中国的坐标系,因为调用project方法带有副作用会直接改变chinaLabelPosition,这样才不会影响原有标签的位置
      const chinaLabelPosition = chinaLabel.position.clone()
      // 然后再转换成标准化设备坐标
      chinaLabelPosition.project(camera)

      // 检测碰撞的物体
      raycaster.setFromCamera(chinaLabelPosition, camera)
      // 第二个参数传true表示会连同检测物体的后代一起检测
      // 注意，css2d对象不会被当做场景里面的东西被检测到
      // 这里还有一个坑，添加的不要将辅助线添加进检测
      const objects = scene.children.filter(object => {
        // 过滤辅助线
        if (object.type === 'AxesHelper') {
          return false
        }
        return true
      })
      const intersect = raycaster.intersectObjects(objects, true)

      // intersect.lengt = 0 的时候证明文字没有碰撞到任何物体，这个时候我们应该显示,否则应该隐藏
      // 如果 intersect.lengt > 0证明有碰撞到其他的物体
      // 我们需要判断碰撞到的物体的距离跟标签到摄像机的距离
      // 获取标签到摄像机的距离
      const chinaLabelDistance = chinaLabel.position.distanceTo(camera.position)
      if (intersect.length === 0) {
        // 中国标签在地球背面,隐藏起来
        chinaLabel.element.classList.remove('hide')
      } else {
        // 判断标签距离是否大于于碰撞最近物体的距离,如果大于则隐藏,否则显示
        const minDistance = intersect[0].distance
        if (chinaLabelDistance > minDistance) {
          chinaLabel.element.classList.add('hide')
        } else {
          chinaLabel.element.classList.remove('hide')
        }
      }

      // 设置越权旋转
      moon.position.set( Math.sin( elapsed ) * 5, 0, Math.cos( elapsed ) * 5 )
      // 开启阻尼
      controls.update()
      requestAnimationFrame( animate )
      renderer.render( scene, camera )
      // 渲染2d渲染器
      labelRenderer.render( scene, camera )
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
      labelRenderer.setSize(rootRef.current.offsetWidth, rootRef.current.offsetHeight)
      // 设置渲染器的像素比
      renderer.setPixelRatio(window.devicePixelRatio)
      labelRenderer.setPixelRatio(window.devicePixelRatio)
    })
  }, [])

  return <div style={{width: '100%', height: '600px'}}>
    <div ref={rootRef} style={{width: '100%', height: '100%', position: 'relative'}} />
  </div>
}
