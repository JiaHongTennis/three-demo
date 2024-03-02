import * as THREE from 'three'

export default class MeshLine {
  constructor (mesh) {
    // 边缘几何体（EdgesGeometry）
    // EdgesGeometry是一种几何体，边缘几何体
    const edges = new THREE.EdgesGeometry(mesh.geometry)
    // 基础材质
    this.material = new THREE.LineBasicMaterial({ color: 0xffffff })
    // (LineSegments)在若干对的顶点之间绘制的一系列的线,需要一个BufferGeometry
    const line = new THREE.LineSegments(edges, this.material)
    const lineCurve = new THREE.CatmullRomCurve3(edges.attributes.position)
    // const line2 = new THREE.Line( edges.attributes.position, this.material )
    // console.log(line2)
    // 模型有可能做了旋转或者缩放,我们需要线性也对应旋转以及缩放,以及位置
    line.scale.copy(mesh.scale)
    line.rotation.copy(mesh.rotation)
    line.position.copy(mesh.position)

    // 转换为管道
    // const geometry = new THREE.TubeGeometry(
    //   // 传入的曲线，注意是区县，不是一个点数组
    //   line,
    //   // 管道的段数
    //   200,
    //   // 可以理解为圆柱的半径,也可以理解为宽度
    //   0.2,
    //   // 管道的横截面，越大越像圆柱，当为2的时候就是一个屏幕，1则是一条线
    //   2,
    //   // 是否闭合
    //   false
    // )

    this.geometry = edges
    this.mesh = line
  }
}
