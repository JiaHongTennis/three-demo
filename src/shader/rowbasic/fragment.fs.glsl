// 低精度
precision lowp float;
// 接收uv变量
varying vec2 vUv;

// 将uv传过来，四个角的颜色则会分别为{0.0， 0.0} {1.0， 0.0,} (1.0, 1.0) {0.0, 1.0}
// 颜色则会分别替换为r跟g

void main() {
  gl_FragColor = vec4(vUv, 0.0, 1.0);
}
