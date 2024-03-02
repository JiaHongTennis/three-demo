import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferAttribute } from 'three'
import doorColor from './images/door/color.png'
import doorAlpa from './images/door/alpha.jpg'
import ambientOcclusion from './images/door/ambientOcclusion.jpg'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个几何体
    const geometry = new THREE.BoxGeometry()
    const cubeColor =  '#ffff00'

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 导入颜色贴图图片生成纹理对象
    const doorTextureLoader = textureLoader.load(doorColor)
    // 导入透明贴图生成透明纹理对象
    const doorAplhaTexture = textureLoader.load(doorAlpa)
    // 导入环境遮挡贴图
    const doorAmbientOcclusion = textureLoader.load(ambientOcclusion)
    // 设置纹理偏移
    if (props.mapStyleOffset) {
      doorTextureLoader.offset.set(0.5, 0.5)
    }
    // 旋转45度
    if (props.mapStyleRotation) {
      // 设置旋转的原点,默认（0， 0）位左下角
      doorTextureLoader.center.set(0.5, 0.5)
      doorTextureLoader.rotation = Math.PI / 4
    }
    // 设置纹理重复
    if (props.mapStyleRepeat) {
      // 横向2个纵向3个
      doorTextureLoader.repeat.set(2, 3)
      // 重复的时候需要更改图片的重复模式,该属性会简单的将纹理重复到无穷大
      // MirroredRepeatWrapping 镜像重复
      doorTextureLoader.wrapS = THREE.MirroredRepeatWrapping
      // RepeatWrapping普通重复
      doorTextureLoader.wrapT = THREE.RepeatWrapping
    }

    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      // 设置颜色
      color: cubeColor,
      // 颜色贴图。可以选择包括一个alpha通道
      map: doorTextureLoader
    })

    // 添加透明纹理
    if (props.mapStyleAlphaMap) {
      material.alphaMap = doorAplhaTexture
      // 需要将材质设置为可透明
      material.transparent = true
      if (props.mapStyleAlphaMap === 'addPlaneGeometry') {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          material
        )
        // 设置平面位置
        plane.position.set(3, 0, 0)
        // 两面都可以看到
        material.side = THREE.DoubleSide
        scene.add(plane)
      }
    }

    // 添加环境遮挡贴图，可以遮挡住光，使图片暗下来
    if (props.mapStyleAmbientOcclusion) {
      material.aoMap = doorAmbientOcclusion
      // 环境遮挡贴图aoMap需要第二组UV
      // 几何体需要添加uv2,从原来的基础上复制一下uv
      geometry.setAttribute('uv2', new BufferAttribute(geometry.attributes.uv.array, 2))
      // 设置环境遮挡贴图强度
      material.aoMapIntensity = 0.5
    }

    // 生成网格
    const cube = new THREE.Mesh( geometry, material )
    // 添加到场景
    scene.add(cube)

    // 设置渲染器，并将渲染器画布放到dom中
    const renderer = new THREE.WebGLRenderer()
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
