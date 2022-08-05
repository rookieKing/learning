
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
  var [err, vsShader] = createShader(gl, gl.VERTEX_SHADER, vs);
  if (err) return [err];
  var [err, fsShader] = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (err) return [err];
  gl.attachShader(program, vsShader);
  gl.attachShader(program, fsShader);
  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) return [gl.getProgramInfoLog(program)];
  gl.detachShader(program, vsShader);
  gl.deleteShader(vsShader);
  gl.detachShader(program, fsShader);
  gl.deleteShader(fsShader);
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

/**
 * 弧度转角度
 * 
 * @param {*} rad 弧度
 * @returns 
 */
export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

/**
 * 角度转弧度
 * 
 * @param {*} deg 角度
 * @returns 
 */
export function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * 是不是 2 的幂
 * 
 * @param {*} value 
 * @returns 
 */
export function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
