// 低精度
precision lowp float;
// 纹理图片1
uniform sampler2D uTexture1;
// 纹理图片2
uniform sampler2D uTexture2;
// 拿到传过来的图片id
varying float vimgIndex;
// 接收顶点传过来的颜色
varying vec3 vColor;

void main() {
  // 采样纹理,第一个参数是传入的纹理图片,第二个参数是点的uv值
  vec4 textureColor;
  if (vimgIndex == 0.0) {
    textureColor = texture2D(uTexture1, gl_PointCoord);
  } else if (vimgIndex == 1.0) {
    textureColor = texture2D(uTexture2, gl_PointCoord);
  }

  gl_FragColor = vec4(vColor, textureColor.r);
}
