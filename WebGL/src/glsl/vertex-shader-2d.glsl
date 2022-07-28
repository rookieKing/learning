// 一个属性变量，将会从缓冲中获取数据
attribute vec2 a_position;

uniform vec2 u_resolution;

// 所有着色器都有一个main方法
void main() {
  // 从像素坐标转换到 0.0 到 1.0
  vec2 zeroToOne = a_position / u_resolution;
  
  // 再把 0->1 转换 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // 把 0->2 转换到 -1->+1 (裁剪空间)
  vec2 clipSpace = zeroToTwo - 1.0;

  // 颠倒 Y 轴
  clipSpace.y *= -1.0;
  // gl_Position 是一个顶点着色器主要设置的变量
  gl_Position = vec4(clipSpace, 0, 1);
}
