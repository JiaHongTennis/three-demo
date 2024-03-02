import React,{ useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 波浪着色器顶点
import { Uniform } from 'three'
import waveVertexShader from '../shader/wave/wave1.vt.glsl'
// 波浪片元着色器
import wavefragmentShader from '../shader/wave/wave1.fs.glsl'

// 波浪着色器顶点2
import wave2VertexShader from '../shader/wave/wave2.vt.glsl'
// 波浪片元着色器2
import wave2fragmentShader from '../shader/wave/wave2.fs.glsl'

export function Demo1 (props) {
  const rootRef = useRef()

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera( 75, rootRef.current.offsetWidth / rootRef.current.offsetHeight, 0.1, 1000 )
    // 设置相机位置
    camera.position.z = 5

    // 创建一个平面几何体
    const geometry = new THREE.PlaneGeometry( 1, 1, 400, 400)
    // 创建着色器材质
    // 着色器可以让我们自己编写顶点着色器代码跟片元着色器代码

    let vertexShader = ''
    let fragmentShader = ''

    // 是否是原始着色器材质
    let material = null
    switch (props.demo) {
      case '1':
        vertexShader = waveVertexShader
        fragmentShader = wavefragmentShader
        break
      case '2':
        vertexShader = wave2VertexShader
        fragmentShader = wave2fragmentShader
        break
    }

    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader()
    // 加载图片
    const mgwlImg = textureLoader.load(require('./images/textures/mgwl.jpg'))


    // shader的编写心得
    // uv是一个很重要的东西，很多图案的变化基本上是靠uv的0~1的变化
    // uv可以看成是一个对象 { x: '0~1', y: '0~1' }
    const shaderArr = [
      // // 1通过顶点对应的uv,决定每一个箱数在uv的位置，通过这个位置决定uv的颜色
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(vUv, 0, 1);
        }
        `
      },
      // 对第一种的变形
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(vUv, 1, 1);
        }
        `
      },
      // 利用uv实现渐变效果,颜色会从左到右rgb会变为0到1
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = vUv.x;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 利用uv实现渐变效果,颜色会从下到上rgb会变为0到1
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = vUv.y;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 1.0-x取反,颜色会从上到下rgb会变为0到1
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = 1.0 - vUv.y;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // vUv.y * 10.0,颜色会从下到上rgb会在1/10的地方就变为1，就会变为白色
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = vUv.y * 10.0;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // vUv.y * 10.0通过取模mod(vUv.y * 10.0, 1.0)就可以达到反复效果
      // mod glsl的取模方法 mod(6, 2) = js的 6 % 2
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = mod(vUv.y * 10.0, 1.0);
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 利用step(edge, x) 如果 x < edge 返回0.0， 否者返回1.0
      // 这方法要么是1.0， 要么是0.0, 因为不会有过渡，所以可以达到斑马线效果
      // edge越大越黑,线条越细
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = mod(vUv.y * 10.0, 1.0);
          strength = step(0.7, strength);
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 条纹相加，我们根据同样的方式也可以获得y轴的斑马线
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.7, strengthx);
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.7, strengthy);
          // 条纹相加
          // 白色是1.0,所以相加就是颜色约白
          float strength = strengthx + strengthy;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 条纹相乘，相乘的情况下1.0 * 0.0 = 0.0 所以只有白色交叉的地方是白色其他都是黑色
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.7, strengthx);
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.7, strengthy);
          // 条纹相加
          // 白色是1.0,所以相加就是颜色约白
          float strength = strengthx * strengthy;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 条纹相减去，相减的情况下看谁减去谁 1.0 - 1.0 = 0.0 被减去的那个的白色会，减掉自己的白色
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.8, strengthx);
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.8, strengthy);
          // 条纹相加
          // 白色是1.0,所以相加就是颜色约白
          float strength = strengthx - strengthy;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 方块图形,将strengthy的step设置成0.8,这白色边只有0.2所以减去的话就是比较大的方块图形
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.2, strengthx);
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.8, strengthy);
          // 条纹相加
          // 白色是1.0,所以相加就是颜色约白
          float strength = strengthx - strengthy;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 绘制箭头
      // 我们需要绘制一个上边的白色条，再绘制一个右边的白色条，再相加
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 右边百分之60白色
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.4, strengthx);
          // 上边百分之20白色
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.8, strengthy);
          // 相乘 宽度百分之60高度百分之20 靠右上角的白色块
          float barX = strengthx * strengthy;
          // 同理可得 宽度百分之20高度百分之60靠右上角的白色块
          float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));

          // 条纹相加
          // 两条靠右上角白色相加就是箭头
          float strength = barX + barY;
          gl_FragColor = vec4(strength, strength, strength, 1);
        }
        `
      },
      // 绘制箭头带有颜色的箭头
      // 上面我们绘制了一个箭头，如果我们把箭头的当做透明度，那就可以得出一个有渐变颜色的箭头
      // 记得材质必须支持透明
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 右边百分之60白色
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.4, strengthx);
          // 上边百分之20白色
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.8, strengthy);
          // 相乘 宽度百分之60高度百分之20 靠右上角的白色块
          float barX = strengthx * strengthy;
          // 同理可得 宽度百分之20高度百分之60靠右上角的白色块
          float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));

          // 条纹相加
          // 两条靠右上角白色相加就是箭头
          float strength = barX + barY;
          gl_FragColor = vec4(vUv, 1.0, strength);
        }
        `
      },
      // 偏移，形成T字,因为uv是0.1,所以mod里面的vUv.x是从0开始变化,我们可以给vUv里面的vUv.x + 加上一个值就可以进行偏移
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 右边百分之60白色
          float strengthx = mod(vUv.x * 10.0, 1.0);
          strengthx = step(0.4, strengthx);
          // 上边百分之20白色
          float strengthy = mod(vUv.y * 10.0, 1.0);
          strengthy = step(0.8, strengthy);
          // 相乘 宽度百分之60高度百分之20 靠右上角的白色块
          float barX = strengthx * strengthy;
          // 同理可得 宽度百分之20高度百分之60靠右上角的白色块
          float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0)) * step(0.4, mod(vUv.y * 10.0, 1.0));

          // 条纹相加
          // 两条靠右上角白色相加就是箭头
          float strength = barX + barY;
          gl_FragColor = vec4(vUv, 1.0, strength);
        }
        `
      },
      // 利用绝对值，可以把负数变成正数,那么可以做镜像效果
      // vUv.x 的区间是[0.0, 1.0]
      // vUv.x - 0.5 区间[-0.5, 0.5]
      // 绝对值abs(vUv.x)可以把-0.5变成0.5就可以做镜像
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = abs(vUv.x - 0.5);
          gl_FragColor = vec4(strength, strength, strength, strength);
        }
        `
      },
      // min 最小值函数,min(a, b),如果 a < b 结果就是a,否者就是b
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 竖向黑色渐变
          float strengthx = abs(vUv.x - 0.5);
          // 同理横向向黑色渐变
          float strengthy = abs(vUv.y - 0.5);
          // min看谁小,min(0.0, 1.0) = 0.0,所以黑色会叠加在一起
          float strength = min(strengthx, strengthy);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // max 同理可得最大值就是看谁大
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 竖向黑色渐变
          float strengthx = abs(vUv.x - 0.5);
          // 同理横向向黑色渐变
          float strengthy = abs(vUv.y - 0.5);
          // max看谁大,min(0.0, 1.0) = 1.0,所以黑色跟白色重合的地方会变成白色所以黑色会比较少
          float strength = max(strengthx, strengthy);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 上一个例子中加上step
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 竖向黑色渐变
          float strengthx = abs(vUv.x - 0.5);
          // 同理横向向黑色渐变
          float strengthy = abs(vUv.y - 0.5);
          // max看谁大,min(0.0, 1.0) = 1.0,所以黑色跟白色重合的地方会变成白色所以黑色会比较少
          // 比0.2大的地方是白色， 比0.2小的地方是黑色，形成圆环效果
          float strength = step(0.2, max(strengthx, strengthy));
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 上一个例子中加上取反就变成小正方形
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 竖向黑色渐变
          float strengthx = abs(vUv.x - 0.5);
          // 同理横向向黑色渐变
          float strengthy = abs(vUv.y - 0.5);
          // max看谁大,min(0.0, 1.0) = 1.0,所以黑色跟白色重合的地方会变成白色所以黑色会比较少
          // 比0.2大的地方是白色， 比0.2小的地方是黑色，形成圆环效果
          // 再取反变成正方形
          float strength = 1.0 - step(0.2, max(strengthx, strengthy));
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 向下取整，实现条纹渐变
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // strength区间[0.0, 10.0]
          float strength = vUv.x * 10.0;
          // 向下取整,区间变成[0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
          // 这样会变成左边1/10是黑色，右边全是白色
          strength = floor(vUv.x * 10.0);
          // strength / 10,会变成[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
          // 所以就会是渐变色条
          strength = strength / 10.0;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 上一个例子中，同理可以得到y轴变化再相乘就可以得到渐变格子
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // strength区间[0.0, 10.0]
          float strengthx = vUv.x * 10.0;
          // 向下取整,区间变成[0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
          // 这样会变成左边1/10是黑色，右边全是白色
          strengthx = floor(vUv.x * 10.0);
          // strength / 10,会变成[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
          // 所以就会是竖向渐变色条
          strengthx = strengthx / 10.0;
          // 同理可以得到横向渐变色条
          float strengthy = floor(vUv.y * 10.0) / 10.0;
          // 相乘变成渐变格子
          float strength = strengthx * strengthy;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 随机效果,glsl没有随机函数，但是我们可以自己写一个模拟随机函数的效果
      // 一般这种函数网上已经有人写出来了，不需要我们自己去写
      // https://thebookofshaders.com/ 这是一个学习shader的网站，里面可以找到一些别人写好的方法
      // 由于是一个国外的网站访问会有些慢,我们可以把这个给网站给下载到本地，或者科学上网
      // 实现随机效果
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 定义随机函数,会返回一个随机数float
        float random (vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
        }

        void main() {
          // 生成随机数
          float strength = random(vUv);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 随机格子
      // 从之前的例子中我们有随机颜色的格子，那么只要将格子的颜色变成随机数就可以了
      // 实际上之所以可以这样，是因为传入固定的值，其实返回的都是同一个值
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 定义随机函数
        // 需要传入一个二维向量,会返回一个随机数float
        float random (vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
        }

        void main() {
          // 生成随机数
          float strength = (floor(vUv.y * 10.0) / 10.0) * (floor(vUv.x * 10.0) / 10.0);
          // 拿到随机格子
          // 将格子的float变为二维向量
          float randomStrength = random(vec2(strength, strength));
          gl_FragColor = vec4(randomStrength, randomStrength, randomStrength, 1.0);
        }
        `
      },
      // 根据length返回向量长度
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 获取二维向量的长度，向量长度就是从圆点到点位置的距离,根据勾股定理可以算出来
          // 会生成一个从圆点开始的1/4圆
          float strength = length(vUv);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 根据distance得出两个向量的距离
      // distance(uv, vec2(0.5, 0.5))
      // 抽象一点理解也可以理解是点之间的距离，uv的中心点事(0.5, 0.5)
      // 也就是说中心店0.5的距离为0是黑色，所以会偶一个中心点扩散变黑的圆
      // 1.0取反变成白色
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 获取二维向量的长度，向量长度就是从圆点到点位置的距离,根据勾股定理可以算出来
          // 会生成一个从圆点开始的黑色的圆
          float strength = distance(vUv, vec2(0.5, 0.5));
          // 取反变成白色的圆
          strength = 1.0 - strength;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 根据相处，实现星星
      // 上一个例子中我们得到了一个白色的扩散点，去掉取反还原成黑色的点
      // 然后用0.15 / strength, 由于strength屏幕中心是由[0.0, 1.0]扩散的圆,所以0.15/strength,会变成中间是[+∞, 0.15 / 1左右,实际上比1大]
      // 这样会形成一个半径为15%内是白色，之后逐渐变黑的圆
      // 最后strength = 0.15 / strength - 1.0; 减去1.0，那么外部基本会变为全黑，剩下里面因为中间的数很大，所以会有一个白色光点。周围有些渐变
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 获取二维向量的长度，向量长度就是从圆点到点位置的距离,根据勾股定理可以算出来
          // 会生成一个从圆点开始的黑色的圆
          float strength = distance(vUv, vec2(0.5, 0.5));
          // 取反变成白色的圆
          strength = 0.15 / strength - 1.0;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 改变uv的y轴变量，实现压缩
      // 上一个例子中我们改变一下vUv中的y变为(y - 0.5) * 5.0这样y轴区间会变为[-2.5, 2.5]会将圆向下压缩
      // 我们还需要(y - 0.5) * 5.0 + 0.5，这样区间会变为[-2.0, 3.0] 高度为 (1  * 15%) / 5
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 获取二维向量的长度，向量长度就是从圆点到点位置的距离,根据勾股定理可以算出来
          // 会生成一个从圆点开始的黑色的圆
          // 然后压缩(y - 0.5) * 5.0
          // (y - 0.5) * 5.0 + 0.5偏移会形成[-2.0, 3.0]区间高度为高度为 (1  * 15%) / 5的椭圆
          float strengthx = distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5));
          // 取反变成白色的圆
          strengthx = 0.15 / strengthx - 1.0;
          // 然后我们可以绘制一个竖向的椭圆
          float strengthy = distance(vec2((vUv.x - 0.5) * 5.0 + 0.5, vUv.y), vec2(0.5, 0.5));
          strengthy = 0.15 / strengthy - 1.0;
          // 然后相加,变成一个十字星星
          float strength = strengthx + strengthy;
          gl_FragColor = vec4(strength, strength, strength, strength);
        }
        `
      },
      // 让星星旋转一下
      // 上一个例子中我们绘制了一个星星，我们需要让他旋转起
      // 这需要一个旋转函数我们去https://thebookofshaders.com/10/?lan=ch 寻找
      //
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 旋转函数
        // uv 旋转的uv
        // rotation 旋转多少度,正数为逆时针旋转
        // mid 旋转的中心点
        // return 返回一个旋转后的向量
        vec2 rotate(vec2 uv, float rotation, vec2 mid) {
          return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
          );
        }

        void main() {
          // 我们先将vUv进行旋转
          // 在glsl中没有π所以我们直接写一个3.14159就是180度 * 0.25就是45度
          // 中心点为vec2(0.5, 0.5)
          vec2 rotateUv = rotate(vUv, 3.14 * 0.25, vec2(0.5, 0.5));
          // 我们将旋转后的uv替换一下
          float strengthx = distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5));
          // 取反变成白色的圆
          strengthx = 0.15 / strengthx - 1.0;

          // 然后我们可以绘制一个竖向的椭圆
          float strengthy = distance(vec2((rotateUv.x - 0.5) * 5.0 + 0.5, rotateUv.y), vec2(0.5, 0.5));
          strengthy = 0.15 / strengthy - 1.0;
          // 然后相加,变成一个十字星星
          float strength = strengthx + strengthy;

          gl_FragColor = vec4(strength, strength, strength, strength);
        }
        `
      },
      // 上个例子基础上
      // 传入时间改变角度,让飞镖旋转起来
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 接收时间
        uniform float uTime;

        // 转转函数
        // uv 旋转的uv
        // rotation 旋转多少度,正数为逆时针旋转
        // mid 旋转的中心点
        // return 返回一个旋转后的向量
        vec2 rotate(vec2 uv, float rotation, vec2 mid) {
          return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
          );
        }

        void main() {
          // 我们先将vUv进行旋转
          // 在glsl中没有π所以我们直接写一个3.14159就是180度 * 0.25就是45度
          // 中心点为vec2(0.5, 0.5)
          // 将0.25改为时间,达到旋转的目的
          vec2 rotateUv = rotate(vUv, 3.14 * uTime, vec2(0.5, 0.5));
          // 我们将旋转后的uv替换一下
          float strengthx = distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5));
          // 取反变成白色的圆
          strengthx = 0.15 / strengthx - 1.0;

          // 然后我们可以绘制一个竖向的椭圆
          float strengthy = distance(vec2((rotateUv.x - 0.5) * 5.0 + 0.5, rotateUv.y), vec2(0.5, 0.5));
          strengthy = 0.15 / strengthy - 1.0;
          // 然后相加,变成一个十字星星
          float strength = strengthx + strengthy;

          gl_FragColor = vec4(strength, strength, strength, strength);
        }
        `
      },
      // 画一个圆环
      // 画一个大的白色圆跟小的黑色圆
      // 相乘那么交叉的地方就是白色圆环
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 小的黑色圈
          float strength = step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.35);
          // 乘以大的白色圈
          strength *= 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.25);
          gl_FragColor = vec4(strength, strength, strength, strength);
        }
        `
      },
      // 只做一会黑色渐变圆环
      // distance(vUv, vec2(0.5, 0.5)) 绘制一个圆
      // distance(vUv, vec2(0.5, 0.5)) - 0.25 将圆扩大，这样圆中间会出现负数
      // abs(distance(vUv, vec2(0.5, 0.5)) - 0.25)取绝对值会将负数变成正数，得到中间白色渐变的点
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = abs(distance(vUv, vec2(0.5, 0.5)) - 0.25);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 上一个例子的渐变环中如果加上step分割，又可以得到一个不是渐变的环
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          float strength = step(0.1, abs(distance(vUv, vec2(0.5, 0.5)) - 0.25));
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 波浪环
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // y随着x的改变产生上下浮动的效果
          // sin(vUv.x * 30.0) 30.0是增大区间所以增加频率
          // sin(vUv.x * 30.0) * 0.1  0.1是上下浮动的幅度
          vec2 waveUv = vec2(
            vUv.x,
            vUv.y + sin(vUv.x * 30.0) * 0.1
          );
          // 改为0.01使得黑色圆环变小
          // 我们将改变后的waveUv的值替换下
          float strength = step(0.01, abs(distance(waveUv, vec2(0.5, 0.5)) - 0.25));
          // 取反变为白色细圆环
          strength = 1.0 - strength;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 波浪环进一步改变x的坐标制作一个随意的形状
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // y随着x的改变产生上下浮动的效果
          // sin(vUv.x * 30.0) 30.0是增大区间所以增加频率
          // sin(vUv.x * 30.0) * 0.1  0.1是上下浮动的幅度
          // 在上一步的基础上让x坐标随着y的变化而变化
          vec2 waveUv = vec2(
            vUv.x + sin(vUv.y * 30.0) * 0.1,
            vUv.y + sin(vUv.x * 30.0) * 0.1
          );
          // 改为0.01使得黑色圆环变小
          // 我们将改变后的waveUv的值替换下
          float strength = step(0.01, abs(distance(waveUv, vec2(0.5, 0.5)) - 0.25));
          // 取反变为白色细圆环
          strength = 1.0 - strength;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 如果继续增加频率则会有更多的形状
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // y随着x的改变产生上下浮动的效果
          // sin(vUv.x * 30.0) 100.0这里改成100.0会变成一种水滴散落的感觉
          // sin(vUv.x * 30.0) * 0.1  0.1是上下浮动的幅度
          // 在上一步的基础上让x坐标随着y的变化而变化
          vec2 waveUv = vec2(
            vUv.x + sin(vUv.y * 100.0) * 0.1,
            vUv.y + sin(vUv.x * 100.0) * 0.1
          );
          // 改为0.01使得黑色圆环变小
          // 我们将改变后的waveUv的值替换下
          float strength = step(0.01, abs(distance(waveUv, vec2(0.5, 0.5)) - 0.25));
          // 取反变为白色细圆环
          strength = 1.0 - strength;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 根据角度显示视图
      // atan数学中正切的反三角函数，也就是邻边/对边
      // 设两锐角分别为A，B，则有下列表示：若tanA=1.9/5，则 A = atan(1.9/5)
      // uv是向量在这里我们可以把uv看错是1.9/5，也就是atan(uv) = 角度大小
      // 比如tan(45℃) = 1,所以 atan(1) = 45℃
      // 而180℃ = 3.14，所以 atan(1) = 45℃ = 3.14 / 4 = 0.785
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 根据向量角度得出一个值
          float angle = atan(vUv.x, vUv.y);
          float strength = angle;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 制作扫描线效果
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 根据向量角度得出一个值
          // 然后我们对vUv - 0.5可以达到将中心点偏移到中间的效果,x方向区间变为[-0.5, 0.5]
          float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
          // 右半边atan()是π[0, 3.14]， 左半边是[-3.14, 0]
          // 但是我们希望旋转一周是[0, 1]
          // 所以我们需要 [-3.14, 3.14]+ 3.14 变为[0, 6.28]
          // [0, 6.28] / 6.28 = [0, 1]
          float strength = (angle + 3.14) / 6.28;
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 上一个例子中的基础上我们画一个白色圆当做透明度截出圆形
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          // 根据向量角度得出一个值
          // 然后我们对vUv - 0.5可以达到将中心点偏移到中间的效果,x方向区间变为[-0.5, 0.5]
          float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
          // 右半边atan()是π[0, 3.14]， 左半边是[-3.14, 0]
          // 但是我们希望旋转一周是[0, 1]
          // 所以我们需要 [-3.14, 3.14]+ 3.14 变为[0, 6.28]
          // [0, 6.28] / 6.28 = [0, 1]
          float strength = (angle + 3.14) / 6.28;
          // 白色的圆
          float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)));

          gl_FragColor = vec4(strength, strength, strength, alpha);
        }
        `
      },
      // 传入时间旋转，完成雷达扫描效果
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 旋转函数
        vec2 rotate(vec2 uv, float rotation, vec2 mid) {
          return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
          );
        }

        // 接收时间
        uniform float uTime;

        void main() {
          vec2 rotateUv = rotate(vUv, - uTime * 5.0, vec2(0.5, 0.5));

          // 根据向量角度得出一个值
          // 然后我们对vUv - 0.5可以达到将中心点偏移到中间的效果,x方向区间变为[-0.5, 0.5]
          float angle = atan(rotateUv.x - 0.5, rotateUv.y - 0.5);
          // 右半边atan()是π[0, 3.14]， 左半边是[-3.14, 0]
          // 但是我们希望旋转一周是[0, 1]
          // 所以我们需要 [-3.14, 3.14]+ 3.14 变为[0, 6.28]
          // [0, 6.28] / 6.28 = [0, 1]
          float strength = (angle + 3.14) / 6.28;
          // 白色的圆
          float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)));

          gl_FragColor = vec4(strength, strength, strength, alpha);
        }
        `
      },
      // 制作万花筒
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        void main() {
          //  区间是[-3.14, 3.14]
          float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
          // 区间变为[-1, 1]
          angle = angle / 3.14;
          // 我们想要制作万花筒需要通过取模mod()
          // angle * 10.0 区间变为[-10.0, 10.0]
          float strength = mod(angle * 10.0, 1.0);

          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 光芒四射效果
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 这个是定义常量语法
        // 注意这个不能有;
        #define PI 3.14

        void main() {
          //  区间是[-3.14, 3.14]
          float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
          // 区间变为[-0.5, 0.5]
          angle = angle / (2.0 * PI);
          // angle * 100.0区间[-50.0, 50.0]
          // sin会产生很多黑白过度
          float strength = sin(angle * 100.0);

          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 效果基本上可以参考这边得到案例
      // 我们需要实现很多真实的效果，比如云朵，大山，水流，烟雾
      // 这些需要很强大的数学算法，对于目前阶段来说这些都比较难
      // 但是幸运的是，这种算法一般来说都是固定的早就有人写好了这些算法
      // https://thebookofshaders.com/
      // 比如接下来我们来实现一些效果,利用噪声函数
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 随机函数
        float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
        }

        // 噪声函数
        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // 需要传入一个二维向量，会返回一个float强度
          // 但是我们会发现，这个效果并不是一个很像随机的效果，这事因为vUv的向量是[0, 1]
          float strength = noise(vUv);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 随机函数
        float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
        }

        // 噪声函数
        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // 需要传入一个二维向量，会返回一个float强度
          // 我们 * 100.0让区间在[0, 100],会得到一个类似线圈用random实现的电视白噪音效果
          // float strength = noise(vUv * 100.0);
          // 我们试着改为 * 10.0,就会得到一个很有意思的图案
          float strength = noise(vUv * 10.0);
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 我们接着尝试下加上step
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 随机函数
        float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
        }

        // 噪声函数
        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // 需要传入一个二维向量，会返回一个float强度
          // 我们 * 100.0让区间在[0, 100],会得到一个类似线圈用random实现的电视白噪音效果
          // float strength = noise(vUv * 100.0);
          // 我们试着改为 * 10.0,就会得到一个很有意思的图案
          // 这里我们加上step分割下看看，会得到一个波纹效果
          float strength = step(0.5, noise(vUv * 10.0));
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 我们接着尝试下加上step,然后再增大一下uUv的区间
      {
        fs: `
        // 低精度
        precision lowp float;
        // 接收uv变量
        varying vec2 vUv;

        // 随机函数
        float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
        }

        // 噪声函数
        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // 需要传入一个二维向量，会返回一个float强度
          // 我们 * 100.0让区间在[0, 100],会得到一个类似线圈用random实现的电视白噪音效果
          // float strength = noise(vUv * 100.0);
          // 我们试着改为 * 10.0,就会得到一个很有意思的图案
          // 这里我们加上step分割下看看，会得到一个波纹效果
          float strength = step(0.5, noise(vUv * 100.0));
          gl_FragColor = vec4(strength, strength, strength, 1.0);
        }
        `
      },
      // 尝试从https://thebookofshaders.com/12/?lan=ch
      // 复制换一个柏林噪声算法
      {
        fs: `
          // 低精度
          precision lowp float;
          // 接收uv变量
          varying vec2 vUv;

          // 算法内调用的函数
          vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

          vec2 fade(vec2 t) {
              return t*t*t*(t*(t*6.0-15.0)+10.0);
          }

          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 permute(vec4 x){
            return mod289(((x*34.0)+1.0)*x);
          }

          // 柏林噪声算法
          float cnoise(vec2 P) {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod289(Pi); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;

            vec4 i = permute(permute(ix) + iy);

            vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
            vec4 gy = abs(gx) - 0.5 ;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;

            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);

            vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;

            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));

            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
          }

          void main() {
            // 柏林噪声
            float strength = step(0.5, cnoise(vUv * 10.0));
            gl_FragColor = vec4(strength, strength, strength, 1.0);
          }
        `
      },
      // 试着换一下参数，制作一种发光线条效果
      {
        fs: `
          // 低精度
          precision lowp float;
          // 接收uv变量
          varying vec2 vUv;

          // 算法内调用的函数
          vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

          vec2 fade(vec2 t) {
              return t*t*t*(t*(t*6.0-15.0)+10.0);
          }

          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 permute(vec4 x){
            return mod289(((x*34.0)+1.0)*x);
          }

          // 柏林噪声算法
          float cnoise(vec2 P) {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod289(Pi); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;

            vec4 i = permute(permute(ix) + iy);

            vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
            vec4 gy = abs(gx) - 0.5 ;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;

            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);

            vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;

            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));

            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
          }

          void main() {
            // 柏林噪声
            // 这里我们试着换成绝对值
            float strength = 1.0 - abs(cnoise(vUv * 10.0));
            gl_FragColor = vec4(strength, strength, strength, 1.0);
          }
        `
      },
      {
        fs: `
          // 低精度
          precision lowp float;
          // 接收uv变量
          varying vec2 vUv;

          // 算法内调用的函数
          vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

          vec2 fade(vec2 t) {
              return t*t*t*(t*(t*6.0-15.0)+10.0);
          }

          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 permute(vec4 x){
            return mod289(((x*34.0)+1.0)*x);
          }

          // 柏林噪声算法
          float cnoise(vec2 P) {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod289(Pi); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;

            vec4 i = permute(permute(ix) + iy);

            vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
            vec4 gy = abs(gx) - 0.5 ;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;

            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);

            vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;

            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));

            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
          }

          void main() {
            // 柏林噪声
            // 这里我们试着换成绝对值
            // float strength = 1.0 - sin(cnoise(vUv * 10.0) * 20.0);
            // 如果我们想让线条变得锐利一点,可以尝试一下加上step
            float strength = 1.0 - step(0.1, sin(cnoise(vUv * 10.0) * 20.0));
            gl_FragColor = vec4(strength, strength, strength, 1.0);
          }
        `
      },
      // 更多的效果需要自己去尝试
      // 混合函数的使用
      // 如果我们想给做完的一个效果根据强度来上颜色的话，可以使用混合函数
      {
        fs: `
          // 低精度
          precision lowp float;
          // 接收uv变量
          varying vec2 vUv;

          // 算法内调用的函数
          vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

          vec2 fade(vec2 t) {
              return t*t*t*(t*(t*6.0-15.0)+10.0);
          }

          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 permute(vec4 x){
            return mod289(((x*34.0)+1.0)*x);
          }

          // 柏林噪声算法
          float cnoise(vec2 P) {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod289(Pi); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;

            vec4 i = permute(permute(ix) + iy);

            vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
            vec4 gy = abs(gx) - 0.5 ;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;

            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);

            vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;

            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));

            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
          }

          void main() {
            float strength = 1.0 - step(0.1, sin(cnoise(vUv * 10.0) * 20.0));
            // 定义两个颜色
            // 黄色
            vec3 color1 = vec3(1.0, 1.0, 0.0);
            // 紫色
            vec3 color2 = vec3(0.0, 1.0, 1.0);
            // 混合函数,用法就是传入两个颜色,第三个参数是一个float
            // 意思是strength = 0的时候用color1
            // strength = 1的时候用color2
            // 如果是中间的的过渡值，那么就是使用color1跟color2中间的过度颜色
            // 就是一半黄色一半紫色的那个颜色
            // vec3 mixColor = mix(color1, color2, 0.5)
            // 所以我们可以根据图案的强度传入进来就可以达到上色的目的
            // 会返回一个vec3也就是一个rgb值
            vec3 mixColor = mix(color1, color2, strength);

            gl_FragColor = vec4(mixColor, 1.0);
          }
        `
      }
    ]

    shaderArr.forEach((item, index) => {
      // 创建材质
      material = new THREE.RawShaderMaterial({
        vertexShader: `
        // 精度范围有3个
        // 高精度 highp -2^16 ~ 2^16
        // 中等精度 mediump -2^10 ~ 2^10
        // 低精度 lowp -2^2 ~ 2^8

        // 低精度
        precision lowp float;
        // 声明顶点，3维向量
        attribute vec3 position;
        // 声明uv
        attribute vec2 uv;
        // 我们将uv给到片元着色器
        varying vec2 vUv;

        // mat4 4维矩阵
        // 投影
        uniform mat4 projectionMatrix;
        // 视图矩阵
        uniform mat4 viewMatrix;
        // 模型矩阵
        uniform mat4 modelMatrix;

        void main() {
          vUv = uv;
          // 定义变量
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
        `,
        fragmentShader: item.fs,
        // 开启双面
        side: THREE.DoubleSide,
        // 传入变量给shader
        uniforms: {
          // 传入一个时间,在动画那里改变时间
          uTime: {
            value: 0
          },
          // 传入一张图片
          uTexture: {
            value: mgwlImg
          }
        }
      })
      material.transparent = true

      // 生成网格
      const cube = new THREE.Mesh(geometry, material)
      // 循环生成位置
      cube.position.set((index % 14) * 1.2 - 8, Math.floor(index / 14) * 1.2 - 3, 0)

      // 添加到场景
      scene.add(cube)
    })

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
      // 获取时间
      const time = clock.getElapsedTime()
      // 改变传入着色器的时间变量
      material.uniforms.uTime.value = time
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
