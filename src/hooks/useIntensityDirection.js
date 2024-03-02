import { useEffect, useRef, useState } from 'react'
// 定义一个键盘按住的力度hook
// 方向按住越久力度越大

export const useIntensityDirection = () => {
  // 定义力度从1~100
  // 键盘是否按下
  const keyIsRepress = useRef(false)
  // 定义一个定时器
  const keyInterval = useRef(null)
  // 定义一个力度
  const [intensity, setIntensity] = useState(0)
  const intensityRef = useRef()
  intensityRef.current = intensity
  // 定义一个当前的方向
  const [direction, setDirection] = useState('none')

  // 键盘抬起
  const keyUpHandel = () => {
    keyIsRepress.current = false
    // 清除定时器
    if (keyInterval.current) {
      window.clearInterval(keyInterval.current)
      keyInterval.current = null
    }
    // 还原力度跟方向
    setDirection('none')
    setIntensity(0)
  }

  // 键盘按住监听(模拟)
  const keyDownRepress = (e) => {
    if (!keyIsRepress.current) {
      // 只有键盘没按住也就是第一次的时候才触发
      // 当按住的时候开启定时器不断增加作为力度
      keyInterval.current = window.setInterval(() => {
        // 每0.05秒增加一个力度,最大是100
        if (intensityRef.current < 100) {
          setIntensity(intensityRef.current + 1)
        }
      }, 0.05 * 1000)
      // 设置当前的方向
      if (e.keyCode === 37) { // 方向左键
        setDirection('left')
        e.preventDefault()
      } else if (e.keyCode === 38) { // 方向上键
        setDirection('top')
        e.preventDefault()
      } else if (e.keyCode === 39) { // 方向右键
        setDirection('right')
        e.preventDefault()
      } else if (e.keyCode === 40) { // 方向下键
        setDirection('bottom')
        e.preventDefault()
      }
    }
  }

  // 键盘按下
  const keyDownHandel = (e) => {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode ===40) {
      keyDownRepress(e)
      // 键盘按住会触发很多次
      keyIsRepress.current = true
    }
  }

  useEffect(() => {
    // 注册键盘事件
    window.addEventListener('keyup', keyUpHandel)
    window.addEventListener('keydown', keyDownHandel)
    return () => {
      // 卸载键盘事件
      window.removeEventListener('keyup', keyUpHandel)
      window.removeEventListener('keydown', keyDownHandel)
    }
  }, [])
  return {
    intensity,
    direction
  }
}
