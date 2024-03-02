import * as THREE from 'three'
// 创建3要素

export const useCreateThree = () => {
  // 创建场景
  const scene = new THREE.Scene()

  // 创建相机
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  // 设置渲染器，并将渲染器画布放到dom中
  const renderer = new THREE.WebGLRenderer()

  return {
    scene,
    camera,
    renderer
  }
}
