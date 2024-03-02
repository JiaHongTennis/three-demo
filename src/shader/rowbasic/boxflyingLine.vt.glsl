// 低精度
precision lowp float;

// 声明顶点，3维向量
attribute vec3 position;
// projectionMatrix * viewMatrix * modelMatrix所有得到顶点都是使用相同的模型，相同的相机，所以都在Uniforms
// 声明uv
attribute vec2 uv;
varying vec2 vUv;
// mat4 4维矩阵

uniform mat4 projectionMatrix;
// 视图矩阵
uniform mat4 viewMatrix;
// 模型矩阵
uniform mat4 modelMatrix;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
