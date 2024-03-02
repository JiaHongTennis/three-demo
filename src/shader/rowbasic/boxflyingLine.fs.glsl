// 低精度
precision lowp float;
// 接收uv变量
varying vec2 vUv;
// 圆周率
#define PI 3.141592654
// 时间
uniform float uTime;

float random (in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() {
  // 颜色混合
  // 盒子的颜色
  vec3 boxColor = vec3(1.0, 0.0, 1.0);
  // 线颜色
  vec3 lineColor = vec3(1.0, 0.0, 1.0);
  // 速度
  float deep = 0.5;

  // 线框
  float lineWidth = (100.0 - 1.0) / 200.0;
  // 偏移量
  float py = uTime * deep;
  // 上下分割
  float topBottomSplit = step(lineWidth, abs(vUv.y - 0.5));
  // 右侧左右分割
  float toRightleftRightSplit = 1.0 - step(1.0 / 3.0, mod((vUv.x * 2.0 / 3.0)  - (2.0 / 3.0 * py) - (2.0 / 3.0), 1.0));
  // [0.0, 1.0][0.0, 1.0]
  // 向右的渐变
  float lineTopToRight = sin(mod(vUv.x * 2.0 - (py * 2.0), 1.0));
  // [1.0][0.0]
  float topToRight = lineTopToRight * toRightleftRightSplit;
  // [0.0][0.0][0.0[1.0]]
  topToRight *= topBottomSplit;

  //向左的渐变
  float lineTopToLeft = 1.0 - sin(mod(vUv.x * 2.0 + (py * 2.0), 1.0));
  // 左侧左右分割
  float toRightleftLeftSplit = 1.0 - step(1.0 / 3.0, mod((vUv.x * 2.0 / 3.0)  + (2.0 / 3.0 * py) - (2.0 / 3.0), 1.0));
  float topToLeft = lineTopToLeft * toRightleftLeftSplit;
  topToLeft *= topBottomSplit;

  // 左右分割成线
  float leftRightSplit = step(lineWidth, abs(vUv.x - 0.5));

  // 下侧上下分割
  float toBtoomTopBtoomSplit = 1.0 - step(1.0 / 3.0, mod((vUv.y * 2.0 / 3.0)  + (2.0 / 3.0 * py) - (2.0 / 3.0), 1.0));
  // 从上到下的渐变
  float LineRightToBtoom = 1.0 - sin(mod(vUv.y * 2.0 + (py * 2.0), 1.0));
  // 右边从上到下的飞线
  float rightToBottom = LineRightToBtoom * toBtoomTopBtoomSplit;
  rightToBottom *= leftRightSplit;


  // 上侧侧上下分割
  float toTopTopBtoomSplit = 1.0 - step(1.0 / 3.0, mod((vUv.y * 2.0 / 3.0)  - (2.0 / 3.0 * py) - (2.0 / 3.0), 1.0));
  // 从下到上的渐变
  float LineRightToTop = sin(mod(vUv.y * 2.0 - (py * 2.0), 1.0));
  // 右边从下到上的飞线
  float rightToTop = toTopTopBtoomSplit * LineRightToTop;
  rightToTop *= leftRightSplit;

  float strength = topToRight + topToLeft + rightToBottom + rightToTop;

  vec3 mixColor = mix(boxColor, lineColor, strength);

  gl_FragColor = vec4(mixColor, strength + 0.3);
}
