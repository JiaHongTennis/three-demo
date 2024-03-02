// 低精度
precision lowp float;
// 接收uv变量
varying vec2 vUv;
// 接收z轴突出的值
varying float vElevation;

// 将uv传过来，四个角的颜色则会分别为{0.0， 0.0} {1.0， 0.0,} (1.0, 1.0) {0.0, 1.0}
// 颜色则会分别替换为r跟g

void main() {
  // z轴是[-0.05, 0.05]区间，但是颜色的值是[0.0, 1.0],颜色不能为负数,因此我们需要做转换
  // [vElevation + 0.05] 会让区间在[0.0, 0.1]之间 * 5.0 + 0.5会让区间在[0.5, 1.0]
  float height = (vElevation + 0.05) * 5.0 + 0.5;
  gl_FragColor = vec4(1.0 * height, 0.0, 0.0, 1.0);
}
