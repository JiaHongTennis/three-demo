import React,{ useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferAttribute } from 'three'
import doorColor from './images/door/color.png'
import doorAlpa from './images/door/alpha.jpg'
import ambientOcclusion from './images/door/ambientOcclusion.jpg'
import heightpng from './images/door/height.jpg'
import roughnessMapimg from './images/door/roughness.jpg'
import metalnessMapimg from './images/door/metalness.jpg'
import normalMapimg from './images/door/normal.jpg'

export function Demo1 (props) {
  const rootRef = useRef()
  // 添加图片加载管理
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1, 200, 200, 200)
    const cubeColor =  '#ffff00'

    // 创建纹理加载器
    let textureLoader = null

    if (props.LoadingManager) {
      const manager = new THREE.LoadingManager()
      // 添加加载监听时间
      manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
        console.log( `Started loading file: ${  url  }.\nLoaded ${  itemsLoaded  } of ${  itemsTotal  } files.` )
      }
      manager.onLoad = function ( ) {
        console.log( '图片加载完成')

      }
      manager.onProgress = function ( url, num, total ) {
        setProgress((num / total) * 100)
        console.log('图片加载完成', url)
        console.log('第', num)
        console.log('图片总数', total)
      }
      manager.onError = function ( url ) {
        console.log(url, '加载失败')
      }
      textureLoader = new THREE.TextureLoader(manager)
    } else {
      textureLoader = new THREE.TextureLoader()
    }

    // 导入颜色贴图图片生成纹理对象
    const doorTextureLoader = textureLoader.load(doorColor)
    // 导入透明贴图生成透明纹理对象
    const doorAplhaTexture = textureLoader.load(doorAlpa)
    // 导入环境遮挡贴图
    const doorAmbientOcclusion = textureLoader.load(ambientOcclusion)
    // 导入位移贴图
    const doorDisplacementMap = textureLoader.load(heightpng)
    // 导入粗糙度贴图
    const doorRoughnessMapimg = textureLoader.load(roughnessMapimg)
    // 导入金属贴图
    const doorMetalnessMapimg = textureLoader.load(metalnessMapimg)
    // 导入法线贴图
    const doorNormalMapimg = textureLoader.load(normalMapimg)

    // 创建标准材质-该材质需要光才能显示
    const material = new THREE.MeshStandardMaterial({
      // 设置颜色
      color: cubeColor,
      // 颜色贴图。可以选择包括一个alpha通道
      map: doorTextureLoader
    })

    // 添加位移贴图，约白的地方约突出
    if (props.displacementMap) {
      material.displacementMap = doorDisplacementMap
      // 位移贴图想要突出出来需要几何体具有足够的顶点，但是现在默认的顶点只有最基本的一个平面6个，所以需要增加顶点
      // 默认位移影响程度是1，如果在当前的门中我们不希望这个大，需要设置影响程度
      material.displacementScale = 0.1
    }

    // 添加透明纹理
    if (props.mapStyleAlphaMap) {
      material.alphaMap = doorAplhaTexture
      // 需要将材质设置为可透明
      material.transparent = true
      if (props.mapStyleAlphaMap === 'addPlaneGeometry') {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1, 200, 200),
          material
        )
        // 设置平面位置
        plane.position.set(1.5, 0, 0)
        // 两面都可以看到
        material.side = THREE.DoubleSide
        scene.add(plane)
      }
    }

    // 添加粗糙度贴图
    if (props.Roughness) {
      // 需要有平行光才能看出光源
      // 越接近0越光滑，越接近1越粗糙
      // material.roughness = 1
      // 可以添加粗糙度贴图，越黑roughness值越接近1，如果两个值都设置则结果会采用相乘
      material.roughnessMap = doorRoughnessMapimg
    }

    // 添加法线贴图
    if (props.normalMap) {
      material.normalMap = doorNormalMapimg
    }

    // 金属贴图，越白的地方约像金属
    // metalness 越接近1约像金属 0越不像金属
    if (props.metalnessMap) {
      material.metalness = 1
      material.metalnessMap = doorMetalnessMapimg
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

    // 添加环境光
    if (props.AmbientLight) {
      // 第二个参数为光的强度
      const light = new THREE.AmbientLight( '#ffff00', 0.5) // soft white light
      scene.add( light )
    }

    // 添加平行光
    if (props.DirectionalLight) {
      const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 )
      // 平行光需要给光源设置一个位置
      directionalLight.position.set(10, 10, 10)
      scene.add( directionalLight )
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

  return <div style={{width: '100%', height: '600px', position: 'relative'}}>
    {props.LoadingManager ? (
      <div style={{width: '200px', height: '10px', backgroundColor: '#ccc', position: 'absolute', top: '10px', right: '10px'}}>
        <div style={{height: '10px', width: `${progress}%`, backgroundColor: 'green', color: '#fff'}}>{`${progress}%`}</div>
      </div>
    ) : ''}
    <div ref={rootRef} style={{width: '100%', height: '100%'}} />
  </div>
}
