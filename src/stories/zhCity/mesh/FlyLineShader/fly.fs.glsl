// 低精度
precision lowp float;
varying float vSize;

void main() {
  // 把点绘制成圆的，gl_PointCoord是点的uv
  float distanceToCenter = distance(gl_PointCoord,vec2(0.5,0.5));
  // 圆点中心的距离
  float strength = 1.0 - (distanceToCenter*2.0);

  // 如果vSize小于0则隐藏掉
  if (vSize <= 0.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
  } else {
    gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
  }
}
