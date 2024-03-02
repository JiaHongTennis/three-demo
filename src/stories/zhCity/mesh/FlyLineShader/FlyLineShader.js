
import * as THREE from 'three'
import gsap from 'gsap'
// 引入飞线着色器
import vtShader from './fly.vt.glsl'
import fsShader from './fly.fs.glsl'

// 着色器飞线
export default class FlyLineShader {
  constructor (position = { x: 0, z: 0 }, color = 0x00ffff) {
    // 1/根据点生成曲线
    const linePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(position.x / 2, 4, position.z / 2),
      new THREE.Vector3(position.x, 0, position.z),
    ]
    // 创建曲线
    this.lineCurve = new THREE.CatmullRomCurve3(linePoints)
    // 拿到曲线上的点数组
    const points = this.lineCurve.getPoints(1000)
    // 2/创建几何顶点
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    // 给每一个顶点设置属性,我们需要知道每一个点的位置,传给着色器
    const aSizeArray = new Float32Array(points.length)
    for (let i = 0; i < aSizeArray.length; i++) {
      aSizeArray[i] = i
    }
    // 设置几何体顶点属性,这样着色器就能拿到aSize属性
    geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(aSizeArray, 1)
    )

    // 着色器材质
    const material = new THREE.RawShaderMaterial({
      vertexShader: vtShader,
      fragmentShader: fsShader,
      // 允许透明
      transparent: true,
      // 渲染材质是否对深度缓冲区有任何影响,默认是开启的，如果开启得的话则会前面的点挡住后面的点
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      // 设置为叠加算法，这个越叠加越亮，但是前提是图片必须不是纯白，具有透明效果才有用，当前实力是在模糊边缘，也就是图片为半透明的时候有叠加效果
      uniforms: {
        // 时间
        uTime: {
          value: 0,
        },
        // 颜色
        uColor: {
          value: new THREE.Color(color),
        },
        // 长度
        uLength: {
          value: points.length,
        },
      },
    })

    // 改变uTime来控制动画
    gsap.to(material.uniforms.uTime, {
      value: 1000,
      duration: 2,
      repeat: -1,
      ease: 'none',
    })

    // 生成点对象
    this.mesh = new THREE.Points( geometry, material )
  }
}
