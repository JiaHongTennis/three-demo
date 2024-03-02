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

    // 灯光
    const dirLight = new THREE.AmbientLight( 0xffffff )
    dirLight.position.set( 0, 0, 2 )
    dirLight.layers.enableAll()
    scene.add( dirLight )

    // 纹理加载器
    const textureLoader = new THREE.TextureLoader()

    // 地球
    const earthGeometry = new THREE.SphereGeometry( 1, 16, 16 )
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

    // three里面提供了很多计算区县的方法Curve
    // 例如CatmullRomCurve3,使用Catmull-Rom算法， 从一系列的点创建一条平滑的三维样条曲线。

    // 使用这个方法传入经过的点,true为闭合的线
    const curve = new THREE.CatmullRomCurve3( [
      new THREE.Vector3( -5, 0, 0 ),
      new THREE.Vector3( 0, 5, -5 ),
      new THREE.Vector3( 5, 0, 0 ),
      new THREE.Vector3( 5, -5, 5 ),
      new THREE.Vector3( 0, -5, 5 )
    ], true )
    // 调用getPoints方法分成50段，也就是51个点
    const points = curve.getPoints( 50 )
    // 通过BufferGeometry的setFromPoints将所有的点传入生成一个BufferGeometry对象
    const geometry = new THREE.BufferGeometry().setFromPoints( points )
    // 然后我们需要创建一个线的材质
    const material = new THREE.LineBasicMaterial( {
      color: 0xffffff,
      linewidth: 1,
      linecap: 'round',
      linejoin:  'round'
    } )
    // 使用线网格，将模型与材质传入
    const line = new THREE.Line( geometry, material )
    // 添加到场景
    scene.add(line)


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
      const elapsed = clock.getElapsedTime()
      // 开启阻尼
      controls.update()
      requestAnimationFrame( animate )

      if (props.demo === '2') {
        // 我们需要设置相机沿着曲线运动可以利用curve.getPoint方法
        // .getPoint ( t : Float, optionalTarget : Vector ) : Vector
        // t - 曲线上的位置。必须在[0,1]范围内
        // 曲线的起点为0终点为1，根据0到1的变化我们就可以拿到中间的点，然后不断设置相机的位置就可以达到移动的目的
        // 根据当前时间，我们直接取模就可以拿到0~1的变化
        const time = elapsed * 0.1 % 1
        // 当前点的位置
        const point =  curve.getPoint(time)
        // 更新相机的位置，注意这个需要用copy而不能用set，因为copy不会改变point，而set实际上是带有副作用的
        camera.position.copy(point)
        // 设置摄像机看向地球，因为地球的位置也在原点，所以看不出来区别
        camera.lookAt(earth.position)
      }

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
