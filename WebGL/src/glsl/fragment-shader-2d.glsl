// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;

// 从顶点着色器中传入的值
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

// 纹理
uniform sampler2D u_texture;
uniform vec4 u_colorMult;
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;

void main() {
  // 由于 v_normal 是插值出来的，和有可能不是单位向量，
  // 可以用 normalize 将其单位化。
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float light = dot(normal, surfaceToLightDirection);
  float specular = 0.0;
  if(light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }

  gl_FragColor = texture2D(u_texture, v_texcoord) * u_colorMult;

  // 将颜色部分（不包括 alpha）和 光照相乘
  gl_FragColor.rgb *= light;

  // 直接加上高光
  gl_FragColor.rgb += specular;

  // 只将颜色部分（不包含 alpha） 和光照相乘
  gl_FragColor.rgb *= light * u_lightColor;

  // 直接和高光相加
  gl_FragColor.rgb += specular * u_specularColor;
}
