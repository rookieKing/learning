// 一个属性变量，将会从缓冲中获取数据
attribute vec2 a_position;

uniform mat3 u_matrix;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
