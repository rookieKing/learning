// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;

// 从顶点着色器中传入的值
varying vec2 v_texcoord;

// 纹理
uniform sampler2D u_texture;
uniform vec4 u_colorMult;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord) * u_colorMult;
}
