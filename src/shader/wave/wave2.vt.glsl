// 低精度
precision lowp float;
// 原始材质的变量需要我们自己去声明，例如position
// 着色器材质的变量
// Varyings 是从顶点着色器传递到片元着色器的变量。我们需要确保在两个着色器中变量的类型和命名完全一致。
// Attributes 与每个顶点关联的变量。例如，顶点位置，法线和顶点颜色都是存储在attribute中的数据。它只能在顶点着色器获取。
// Uniforms 全局变量。可以传入顶点着色器，也可以传入片元着色器，在整个渲染过程中保持不变的变量。比如灯光，雾和阴影踢贴图就是被储存在Uniforms

// 声明顶点，3维向量
attribute vec3 position;
// projectionMatrix * viewMatrix * modelMatrix所有得到顶点都是使用相同的模型，相同的相机，所以都在Uniforms
// 声明uv
attribute vec2 uv;
// 我们将uv给到片元着色器
varying vec2 vUv;
// 一旦片元着色器使用，我们需要给一个浮点数精度,否则会报错No precision specified for (float)

// 精度范围有3个
// 高精度 highp -2^16 ~ 2^16
// 中等精度 mediump -2^10 ~ 2^10
// 低精度 lowp -2^2 ~ 2^8
// 一般声明在最上层

// mat4 4维矩阵
// 投影
uniform mat4 projectionMatrix;
// 视图矩阵
uniform mat4 viewMatrix;
// 模型矩阵
uniform mat4 modelMatrix;

// 定义z轴突出的变量
varying float vElevation;

// 获取时间
uniform float uTime;

void main() {
  vUv = uv;
  // 定义变量
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // 改变z轴的坐标等于sin(x轴)，这样可以有一个波浪形状
  // * 10.0 是因为要让波浪扭曲频率大一点，注意modelPosition.x是浮点型所以需要跟浮点型相乘，否则会报错
  // * 0.05 是因为sin的值是0.1 我们想让他在0~0.1之间
  // 该效果是会改变顶点的位置,如果顶点太少就看不到效果
  // 我们需要让他动起来需要从外面传入一个时间的值，然后立马接收他，然后再根据再去加上去sin函数中，达到会动的效果
  modelPosition.z = sin((modelPosition.x + uTime) * 10.0) * 0.02;
  // 前面是x轴的波浪，如果我们想y轴也有变化，那么很简单，同理，我们要让z轴的坐标受y轴坐标影响,在加上去
  modelPosition.z += sin((modelPosition.y + uTime) * 10.0) * 0.02;
  // 我们希望实现一个类似光照的效果，突起的时候颜色会更鲜艳凹进去的时候颜色则越黑
  // 我们需要将z轴的坐标传给片元着色器
  vElevation = modelPosition.z;

  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
