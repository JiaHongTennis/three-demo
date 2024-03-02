// 低精度
precision lowp float;

void main() {
  // gl_PointCoord是片元着色器的内置变量,作用类似于uv,但是跟uv不同的是圆点在左上角，自上向下/从左到右为正
  float strength = distance(gl_PointCoord, vec2(0.5, 0.5));
  strength = strength * 2.0;
  strength = 1.0 - strength;

  gl_FragColor = vec4(strength, strength, strength, strength);
}
