// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;

uniform mat4 u_matrix;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = u_matrix * a_position;
}
