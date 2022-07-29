// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = u_matrix * a_position;

  // 将颜色传递给片断着色器
  v_color = a_color;
}
