// 一个属性变量，将会从缓冲中获取数据
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

// 所有着色器都有一个main方法
void main() {
  // 使位置和矩阵相乘
  gl_Position = u_worldViewProjection * a_position;

  // 传递纹理坐标到片断着色器
  v_texcoord = a_texcoord;

  // 重定向法向量并传递给片断着色器
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  // 计算表面的世界坐标
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // 计算表面到光源的方向
  // 传递给片断着色器
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // 计算表面到相机的方向
  // 然后传递到片断着色器
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
