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

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
