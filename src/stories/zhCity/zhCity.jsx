import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import gsap from 'gsap'
import MeshLine from './mesh/MeshLine/MeshLine'
import FlyLine from './mesh/FlyLine'

import FlyLineShader from './mesh/FlyLineShader/FlyLineShader'


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
    // 设置渲染画布大小
    renderer.setSize( rootRef.current.offsetWidth, rootRef.current.offsetHeight )
    rootRef.current.appendChild( renderer.domElement )
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 设置控制器的阻尼,必须在动画调用update
    controls.enableDamping = true

    const light = new THREE.AmbientLight( '#ffff00', 0.5) // soft white light
    scene.add( light )

    // 灯光
    const dirLight = new THREE.AmbientLight( 0xffffff )
    dirLight.position.set( 0, 0, 2 )
    dirLight.layers.enableAll()
    scene.add( dirLight )

    // 创建FBX加载器
    const fbxloader = new FBXLoader()
    const mode2Unforms = {
      uTime: {
        value: 0
      }
    }
    // 加载模型
    fbxloader.load('/model/mode2/mode2.fbx', (fbx) => {
      fbx.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material.emissiveMap = child.material.map
          child.material.emissive = new THREE.Color(1, 1, 1)
          child.material.emissiveIntensity = 1.3
          if (child.name.startsWith('smallMap')) {
            child.material.onBeforeCompile = (shader => {
              initShader(shader)
              // 添加建筑材质光波扩散特效
              addSpread(shader, new THREE.Vector2(50, 50))
              addLightLine(shader)
            })
          }
          if (child.name.startsWith('huizhan')) {
            // 添加建筑物线
            const meshLine = new MeshLine(child)
            scene.add(meshLine.mesh)
            child.material.onBeforeCompile = (shader => {
              initShader(shader)
              // 建筑模型添加向上的线
              addTopLine(shader)
            })
          }
        }
      })
      scene.add(fbx)
    })

    // 添加一条图片飞线,传入x跟z
    const flyLine = new FlyLine({ x: 0, z: 5 })
    scene.add(flyLine.mesh)

    // 添加着色器飞线
    const flyLineShader = new FlyLineShader({x: 5, z: 5})
    scene.add(flyLineShader.mesh)

    // 初始化着色器,例如传入特定的变量之类的
    function initShader (shader) {
      // 顶点着色器,定义一个顶点信息vPosition，传给片元着色器
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
          #include <common>
          varying vec3 vPosition;
          `
      )
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
          #include <begin_vertex>
          vPosition = position;
      `
      )
      // 片元着色器,接收顶点信息
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
          #include <common>

          uniform vec3 uTopColor;
          uniform float uHeight;
          varying vec3 vPosition;
        `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
          #include <dithering_fragment>
          //#end#
        `
      )
    }

    // 圆形扩散效果
    function addSpread (shader, center = new THREE.Vector2(0, 0)) {
      // 设置扩散的中心点
      shader.uniforms.uSpreadCenter = { value: center }
      //   扩散的时间
      shader.uniforms.uSpreadTime = { value: 0 }
      //   设置条带的宽度
      shader.uniforms.uSpreadWidth = { value: 2 }

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
          #include <common>
          uniform vec2 uSpreadCenter;
          uniform float uSpreadTime;
          uniform float uSpreadWidth;
          `
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        // 我们需要绘制一个扩散的效果,可以使用一元二次方程y = a(x - h)^2 + k
        // a为负值开口向下 顶点(h, k),
        // 初中的一元二次方程可以看这边脑补https://wenku.baidu.com/view/beb9c14e9cc3d5bbfd0a79563c1ec5da51e2d615.html?_wkts_=1673422006510&bdQuery=y+%3D+ax%5E2+%2B+bx+%2B+c

        // 首先我们要我们要根据与中心点的距离得到圆半径
        float spreadRadius = distance(vec2(vPosition.x, vPosition.y),uSpreadCenter);

        // 根据一元二次方程算出扩散范围
        // 思路是利用抛物线开口向下,然后把顶点定义在y都为正的地方,然后用圆半径spreadRadius这个变量当做x的值
        // 我们改变uSpreadTime这个值就可以达到一个y值=[负无穷，正直，负无穷]
        // 将y值当做透明度那么就可以得到一个圆环然后，我们只需要改变h变量也就是uSpreadTime时间就可以将抛物线右移,得到扩散效果
        float spreadIndex = -(spreadRadius-uSpreadTime)*(spreadRadius-uSpreadTime)+uSpreadWidth;

        if (spreadIndex > 0.0) {
          // 判断当spreadIndex为正的时候我们混合一个颜色
          gl_FragColor = mix(gl_FragColor, vec4(1, 1, 1, 1), spreadIndex/uSpreadWidth);
        }
        // gl_FragColor.rgb = vec3(spreadRadius, spreadRadius, spreadRadius);
        `
      )
      // 物体位置动画
      gsap.to(shader.uniforms.uSpreadTime, {
        // x变为5
        value: 30,
        repeat: -1,
        // 往返运动
        yoyo: true,
        // 延迟2秒
        delay: 0,
        // 线性
        ease: 'none',
        // 花5秒
        duration: 2
      })
    }

    // 线性斜向
    function addLightLine (shader) {
      //   扩散的时间
      shader.uniforms.uLightLineTime = { value: -100 }
      //   设置条带的宽度
      shader.uniforms.uLightLineWidth = { value: 0.5 }

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
          #include <common>
          uniform float uLightLineTime;
          uniform float uLightLineWidth;
          `
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        '//#end#',
        `
          // 作为线性的移动跟圆形扩散理念，只是把原本跟圆心的距离变为了某个轴
          // vPosition.x这样可以让距离x轴某个方位内形成一条线
          // 不断改变uLightLineTime可以让线移动

          float LightLineMix = -(vPosition.x-uLightLineTime)*(vPosition.x-uLightLineTime)+uLightLineWidth;

          if(LightLineMix>0.0){
              gl_FragColor = mix(gl_FragColor,vec4(0.8,1.0,1.0,1),LightLineMix /uLightLineWidth);
          }

          //#end#
          `
      )

      gsap.to(shader.uniforms.uLightLineTime, {
        value: 160,
        duration: 3,
        yoyo: true,
        ease: 'none',
        repeat: -1,
      })
    }

    // 向上的线
    function addTopLine (shader) {
      //   扩散的时间
      shader.uniforms.uToTopTime = { value: 0 }
      //   设置条带的宽度
      shader.uniforms.uToTopWidth = { value: 0.5 }

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
              #include <common>


              uniform float uToTopTime;
              uniform float uToTopWidth;
              `
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        '//#end#',
        `
            // 正常是根据y的方向，介于模型的原因我们改用z轴
            float ToTopMix = -(vPosition.z-uToTopTime)*(vPosition.z-uToTopTime)+uToTopWidth;

            if(ToTopMix>0.0){
                gl_FragColor = mix(gl_FragColor,vec4(0.8,0.8,1,1),ToTopMix /uToTopWidth);

            }

            //#end#
            `
      )
      gsap.to(shader.uniforms.uToTopTime, {
        value: 30,
        duration: 3,
        yoyo: true,
        ease: 'none',
        repeat: -1,
      })
    }


    // 设置时钟
    const clock = new THREE.Clock()

    function animate () {
      const elapsed = clock.getElapsedTime()
      mode2Unforms.uTime.value = elapsed
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
