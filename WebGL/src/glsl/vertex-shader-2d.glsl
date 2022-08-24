// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = u_projection * u_view * u_world * a_position;

  // 传递世界位置给片断着色器
  v_worldPosition = (u_world * a_position).xyz;

  // 转换法线并传递给片断着色器
  v_worldNormal = mat3(u_world) * a_normal;
}
