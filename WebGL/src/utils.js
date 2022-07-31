
/**
 * @example createProgram(gl, '', '');
 * @example createProgram(gl, [''], ['']);
 * 
 * @param {WebGLRenderingContextBase} gl 
 * @param {String|Array} vs 
 * @param {String|Array} fs 
 * @returns [error, program]
 */
export function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  if (!vs.map) vs = [vs];
  if (!fs.map) fs = [fs];
  const shaders = [
    ...vs.map(source => createShader(gl, gl.VERTEX_SHADER, source)[1]),
    ...fs.map(source => createShader(gl, gl.FRAGMENT_SHADER, source)[1]),
  ];
  shaders.forEach(shader => {
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) return [gl.getProgramInfoLog(program)];
  shaders.forEach(shader => {
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
  });
  return [null, program];
}

function createShader(gl, type, source) {
  // 创建着色器对象
  const shader = gl.createShader(type);
  // 提供数据源
  gl.shaderSource(shader, source);
  // 编译 -> 生成着色器
  gl.compileShader(shader);
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) return [gl.getShaderInfoLog(shader)];
  return [null, shader];
}

export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

export function degToRad(deg) {
  return deg * Math.PI / 180;
}
