// 低精度
precision lowp float;
// sampler2D是图片纹理的类型
uniform sampler2D uTexture;

void main() {
  // 采样纹理,第一个参数是传入的纹理图片,第二个参数是点的uv值
  vec4 textureColor = texture2D(uTexture, gl_PointCoord);

  gl_FragColor = vec4(textureColor.rg, 0.0, textureColor.r);
}
