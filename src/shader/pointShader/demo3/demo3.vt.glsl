// 精度范围有3个
// 高精度 highp -2^16 ~ 2^16
// 中等精度 mediump -2^10 ~ 2^10
// 低精度 lowp -2^2 ~ 2^8
// 一般声明在最上层
// 低精度
precision lowp float;

attribute vec3 position;
// 拿到图片id属性
attribute float imgIndex;
// 每个点的颜色
attribute vec3 color;
// 传给片元的颜色
varying vec3 vColor;
// 拿到点的大小
attribute float aScale;
varying vec2 vUv;
// 传给片元着色器的图片id
varying float vimgIndex;
// 接收时间
uniform float uTime;

// mat4 4维矩阵
// 投影
uniform mat4 projectionMatrix;
// 视图矩阵
uniform mat4 viewMatrix;
// 模型矩阵
uniform mat4 modelMatrix;

void main() {
  vColor = color;
  vimgIndex = imgIndex;
  // 模型矩阵跟顶点相乘后的结果modelPosition
  // 这个值可以拿到顶点的实际的xyz坐标
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // 我们需要做一个旋转效果
  // 首先要拿到当前点的角度,再根据时间偏移的角度，得到最终的角度，再转换为xz坐标，然后改变xz坐标

  // 因为星璇的坐标就在中心点
  // 获取顶点坐标角度
  float angle = atan(modelPosition.x, modelPosition.z);
  // 获取顶点到中心点额距离
  float diatanceToCenter = length(modelPosition.xz);
  // 我们需要做一个距离中心点越远旋转速度越慢的动画
  float angleOffset = 1.0/diatanceToCenter * uTime;
  angle = angle + angleOffset;
  // 我们再改变模型矩阵计算后的顶点的坐标,已知道新坐标的角度跟半径，通过三角函数可以算出来xz的坐标
  modelPosition.x = cos(angle) * diatanceToCenter;
  modelPosition.z = sin(angle) * diatanceToCenter;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // viewPosition 就是视图矩阵跟模型矩阵计算出来的物体的结果
  // viewPosition可以理解成相机，或者是人的研究
  // 相机的位置是0,看向的地方是z轴,他是一个负值，距离越远值越小

  // 点材质需要设置一个点的大小，否者不会显示
  gl_PointSize = (aScale * 50.0) / -viewPosition.z;
  vimgIndex = imgIndex;
}
