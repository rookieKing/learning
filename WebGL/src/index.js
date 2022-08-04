
import { m4 } from 'twgl.js';
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram, radToDeg, degToRad } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'
import { setGeometry, setTexcoords } from './help.js'

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

var cameraAngleRadians = degToRad(0);
var fieldOfViewRadians = degToRad(60);
var rotationSpeed = .5; // 每秒半圈
var then = 0;

// Setup a ui.

var positionBuffer = gl.createBuffer();
// 将绑定点绑定到缓冲数据（positionBuffer）
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 将几何数据存到缓冲
setGeometry(gl);
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

// 给颜色创建一个缓冲
var texcoordBuffer = gl.createBuffer();
// 绑定颜色缓冲
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
// 将颜色值传入缓冲
setTexcoords(gl);
// 以浮点型格式传递纹理坐标
gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 0, 0);
// 创建一个纹理
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// 用 1x1 个蓝色像素填充纹理
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
  new Uint8Array([0, 0, 255, 255]));
// 异步加载图像
var image = new Image();
image.src = "res/f-texture.png";
image.addEventListener('load', function () {
  // 现在图像加载完成，拷贝到纹理中
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
});

// 启用深度缓冲
gl.enable(gl.DEPTH_TEST);
// 启用背面剔除
gl.enable(gl.CULL_FACE);
// 告诉它用我们之前写好的着色程序（一个着色器对）
gl.useProgram(program);
gl.enableVertexAttribArray(a_position);
// 启用纹理属性
gl.enableVertexAttribArray(a_texcoord);

function drawScene(now) {
  var deltaTime = now - then;
  // 使用时间差计算旋转的角度
  cameraAngleRadians = degToRad((radToDeg(cameraAngleRadians) + rotationSpeed * 360 / 1000 * deltaTime) % 360);
  then = now;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 清空画布
  gl.clearColor(0, 0, 0, 0);
  // 清空画布和深度缓冲
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // 计算投影矩阵
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 1;
  var zFar = 2000;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  // 计算相机的矩阵
  var numFs = 5;
  var radius = 200;
  var cameraMatrix = m4.rotationY(cameraAngleRadians);
  cameraMatrix = m4.translate(cameraMatrix, [0, 0, radius * 1.5]);
  // 计算第一个 F 的位置
  var fPosition = [radius, 0, 0];
  // 获得矩阵中相机的位置
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];
  var up = [0, 1, 0];
  // 计算相机的朝向矩阵
  cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
  // 通过相机矩阵计算视图矩阵
  var viewMatrix = m4.inverse(cameraMatrix);
  // 计算组合矩阵
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  for (var ii = 0; ii < numFs; ++ii) {
    var angle = ii * Math.PI * 2 / numFs;
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;
    // 从视图投影矩阵开始
    // 计算 F 的矩阵
    var matrix = m4.translate(viewProjectionMatrix, [x, 0, y]);
    matrix = m4.rotateX(matrix, Math.PI);
    matrix = m4.translate(matrix, [-50, -75, -15]);
    // 设置矩阵
    gl.uniformMatrix4fv(u_matrix, false, matrix);
    // 使用纹理 0
    gl.uniform1i(u_texture, 0);
    // 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
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
