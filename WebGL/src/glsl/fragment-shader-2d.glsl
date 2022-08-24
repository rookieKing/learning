// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;

varying vec3 v_normal;

// 纹理
uniform samplerCube u_texture;

void main() {
  gl_FragColor = textureCube(u_texture, normalize(v_normal));
}
