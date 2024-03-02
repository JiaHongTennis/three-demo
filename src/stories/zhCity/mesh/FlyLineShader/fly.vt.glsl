attribute vec3 position;
// 顶点的位置下标
attribute float aSize;
// 投影
uniform mat4 projectionMatrix;
// 视图矩阵
uniform mat4 viewMatrix;
// 模型矩阵
uniform mat4 modelMatrix;

varying float vSize;
// 接收时间[0~1000]
uniform float uTime;
// 点的长度
uniform float uLength;


void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // aSize 是从0开始到点的总长度1000
  // 我们想要显示一段的线需要转换一下(aSize - 500) * 0.01
  // vSize = (aSize - 500.0) * 0.1;
  // 但是这样aSize为负值的地方实际上还是有很小的点会显示，我们需要传给片元着色器，判断如果aSize为负值透明度设为0

  // 动态飞线的思路是绘制两端从线，然后通过偏移来让线移动,这样线的尾端可以连接下一条线的顶端
  vSize = (aSize - uTime);
  if (vSize < 0.0) {
    // 这个是镜像翻转操作可以形成[0~uLength][0~uLength]
    vSize = uLength + vSize;
  }
  // 当第一端线完全走完的时候,也就是到了第二段的头在最后面，这个时候跟一开始的第一段的头重合
  // 然后马上把uTime从1000变为0也就是说变成第一段的头在前面，反复循环就能形成飞线
  vSize = (vSize - 500.0) * 0.1;

  // 近大远小
  gl_PointSize = -vSize/viewPosition.z;
}
