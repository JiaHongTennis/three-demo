
import * as THREE from 'three'
import gsap from 'gsap'

// 创建一条飞线,使用定时器改变图片位置的方式
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
    // 通过点创建一条管道TubeGeometry
    const geometry = new THREE.TubeGeometry(
      // 传入的曲线，注意是区县，不是一个点数组
      this.lineCurve,
      // 管道的段数
      200,
      // 可以理解为圆柱的半径,也可以理解为宽度
      0.2,
      // 管道的横截面，越大越像圆柱，当为2的时候就是一个屏幕，1则是一条线
      2,
      // 是否闭合
      false
    )
    // 创建纹理
    const textloader = new THREE.TextureLoader()
    this.texture = textloader.load(require('./images/z_11.png'))
    // 管道其实是一个圆柱体，因为管道的横截面积只有2是一个条带的样子，但是贴图的时候其实是会贴在两个面
    // 所以我们需要重复平铺水平方向为两个,并且是镜像平铺
    this.texture.repeat.set(1, 2)
    // MirroredRepeatWrapping 镜像重复
    this.texture.wrapT = THREE.MirroredRepeatWrapping
    // 3/设置飞线材质
    // 基础材质
    const material = new THREE.MeshBasicMaterial({
      // 贴上图片
      map: this.texture,
      // 支持透明
      transparent: true,
    })
    this.mesh = new THREE.Mesh( geometry, material )

    // 使用gsap改变贴图的位置,让线动起来
    gsap.to(this.texture.offset, {
      x: -1,
      duration: 1,
      repeat: -1,
      ease: 'none',
    })
  }
}
