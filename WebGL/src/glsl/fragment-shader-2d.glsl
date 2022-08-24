// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;

// 从顶点着色器传入的
varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

// 纹理
uniform samplerCube u_texture;

// 相机位置
uniform vec3 u_worldCameraPosition;

void main() {
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - u_worldCameraPosition);
  vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
  gl_FragColor = textureCube(u_texture, direction);
}
