// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;

// 从顶点着色器中传入的值
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;

// 纹理
uniform sampler2D u_texture;
uniform vec4 u_colorMult;

void main() {
  // 由于 v_normal 是插值出来的，和有可能不是单位向量，
  // 可以用 normalize 将其单位化。
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  float light = dot(normal, surfaceToLightDirection);

  gl_FragColor = texture2D(u_texture, v_texcoord) * u_colorMult;

  // 将颜色部分（不包括 alpha）和 光照相乘
  gl_FragColor.rgb *= light;
}
