// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
uniform float u_fudgeFactor;

varying vec4 v_color;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  vec4 position = u_matrix * a_position;

  // 调整除数
  float zToDivideBy = 1.0 + position.z * u_fudgeFactor;

  // x 和 y 除以调整后的除数
  // gl_Position = vec4(position.xy / zToDivideBy, position.zw);
  // gl_Position = vec4(position.xyz / zToDivideBy, position.w);
  // WebGL 会将 gl_Position 中的 x,y,z 自动除以 w，w 默认为 1
  gl_Position = vec4(position.xyz, zToDivideBy);

  // 将颜色传递给片断着色器
  v_color = a_color;
}
