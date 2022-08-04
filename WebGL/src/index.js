
import { m4 } from 'twgl.js';
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram, radToDeg, degToRad } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'
import { Cube } from './help.js'

document.querySelector('#app').innerHTML = template;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl");
var [, program] = createProgram(gl, vertexShaderSource, fragmentShaderSource);
// attribute
var a_position = gl.getAttribLocation(program, "a_position");
var a_texcoord = gl.getAttribLocation(program, "a_texcoord");
// uniform
var u_matrix = gl.getUniformLocation(program, "u_matrix");
var u_texture = gl.getUniformLocation(program, "u_texture");
var u_colorMult = gl.getUniformLocation(program, "u_colorMult");

var cameraAngleRadians = degToRad(0);
var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var then = 0;

// Setup a ui.

var positionBuffer = gl.createBuffer();
// 将绑定点绑定到缓冲数据（positionBuffer）
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 将几何数据存到缓冲
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.position), gl.STATIC_DRAW);
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

// 给颜色创建一个缓冲
var texcoordBuffer = gl.createBuffer();
// 绑定颜色缓冲
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
// 将颜色值传入缓冲
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.texcoord), gl.STATIC_DRAW);
// 以浮点型格式传递纹理坐标
gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 0, 0);
// 创建一个纹理
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
const alignment = 1;
gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
// 用 3x2 的像素填充纹理
const level = 0;
const internalFormat = gl.LUMINANCE;
const width = 3;
const height = 2;
const border = 0;
const format = gl.LUMINANCE;
const type = gl.UNSIGNED_BYTE;
const data = new Uint8Array([
  128, 64, 128,
  0, 192, 0,
]);
gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
  format, type, data);
// 设置筛选器，我们不需要使用贴图所以就不用筛选器了
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// 创建渲染对象
const targetTextureWidth = 256;
const targetTextureHeight = 256;
const targetTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, targetTexture);
// 定义 0 级的大小和格式
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, targetTextureWidth, targetTextureHeight, 0,
  gl.RGBA, gl.UNSIGNED_BYTE, null);
// 设置筛选器，不需要使用贴图
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// 创建并绑定帧缓冲
const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
// 附加纹理为第一个颜色附件
const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(
  gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, 0);
// 创建一个深度缓冲
const depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
// 设置深度缓冲的大小和targetTexture相同
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
// 启用深度缓冲
gl.enable(gl.DEPTH_TEST);
// 启用背面剔除
gl.enable(gl.CULL_FACE);
// 告诉它用我们之前写好的着色程序（一个着色器对）
gl.useProgram(program);
gl.enableVertexAttribArray(a_position);
// 启用纹理属性
gl.enableVertexAttribArray(a_texcoord);

function drawF(aspect) {
  // 计算投影矩阵
  var zNear = 1;
  var zFar = 2000;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  // 计算相机的矩阵
  var radius = 200;
  var cameraMatrix = m4.rotationY(cameraAngleRadians);
  cameraMatrix = m4.translate(cameraMatrix, [0, 0, 3]);
  // 通过相机矩阵计算视图矩阵
  var viewMatrix = m4.inverse(cameraMatrix);
  // 计算组合矩阵
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  [-1, 0, 1].forEach(x => {
    // 计算 F 的矩阵
    var matrix = m4.translate(viewProjectionMatrix, [x * .9, 0, 0]);

    matrix = m4.rotateX(matrix, modelXRotationRadians * x);
    matrix = m4.rotateY(matrix, modelYRotationRadians * x);
    // 设置矩阵
    gl.uniformMatrix4fv(u_matrix, false, matrix);
    // 使用纹理 0
    gl.uniform1i(u_texture, 0);
    const c = x * .5 + .5;
    gl.uniform4fv(u_colorMult, [c, 1, 1 - c, 1]);
    // 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  });
}

function drawScene(now) {
  var deltaTime = now - then;
  then = now;
  // Animate the rotation
  modelYRotationRadians += -0.0007 * deltaTime;
  modelXRotationRadians += -0.0004 * deltaTime;
  // 通过绑定帧缓冲绘制到纹理
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // 使用 3×2 的纹理渲染
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 告诉WebGL如何从裁剪空间映射到像素空间
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);

    // 清空画布和深度缓冲
    gl.clearColor(.5, 7, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = targetTextureWidth / targetTextureHeight;
    drawF(aspect);
  }
  // 渲染到画布
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // 使用刚才渲染的纹理
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // 告诉WebGL如何从裁剪空间映射到像素空间
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布和深度缓冲
    gl.clearColor(1, 1, 1, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    drawF(aspect);
  }
  requestAnimationFrame(drawScene);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  requestAnimationFrame(drawScene);
}
window.addEventListener('resize', resize);
resize();
