// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

varying vec2 v_texcoord;
varying vec3 v_normal;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = u_worldViewProjection * a_position;

  // 传递纹理坐标到片断着色器
  v_texcoord = a_texcoord;

  // 重定向法向量并传递给片断着色器
  v_normal = mat3(u_world) * a_normal;
}
