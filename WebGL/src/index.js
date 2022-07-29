
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'
import { setGeometry, m4 } from './help.js'

document.querySelector('#app').innerHTML = template;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl");
var [, program] = createProgram(gl, vertexShaderSource, fragmentShaderSource);
// attribute
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// uniform
var matrixLocation = gl.getUniformLocation(program, "u_matrix");
var colorUniformLocation = gl.getUniformLocation(program, "u_color");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 将几何数据存到缓冲
setGeometry(gl);

var translation = [45, 150, 0];
var rotation = [degToRad(40), degToRad(25), degToRad(325)];
var scale = [1, 1, 1];
var color = [Math.random(), Math.random(), Math.random(), 1];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
}
window.addEventListener('resize', resize);
resize();

// Setup a ui.
webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
webglLessonsUI.setupSlider("#z", { value: translation[2], slide: updatePosition(2), max: gl.canvas.height });
webglLessonsUI.setupSlider("#angleX", { value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360 });
webglLessonsUI.setupSlider("#angleY", { value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360 });
webglLessonsUI.setupSlider("#angleZ", { value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360 });
webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
webglLessonsUI.setupSlider("#scaleZ", { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });

function updateScale(index) {
  return function (event, ui) {
    scale[index] = ui.value;
    drawScene();
  };
}

function updateRotation(index) {
  return function (event, ui) {
    var angleInDegrees = ui.value;
    var angleInRadians = angleInDegrees * Math.PI / 180;
    rotation[index] = angleInRadians;
    drawScene();
  };
}

function updatePosition(index) {
  return function (event, ui) {
    translation[index] = ui.value;
    drawScene();
  };
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 清空画布
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 告诉它用我们之前写好的着色程序（一个着色器对）
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // 将绑定点绑定到缓冲数据（positionBuffer）
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
  var size = 3;          // 每次迭代运行提取两个单位数据
  var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
  var normalize = false; // 不需要归一化数据
  var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
  // 每次迭代运行运动多少内存到下一个数据开始点
  var offset = 0;        // 从缓冲起始位置开始读取
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)

  // 设置颜色
  gl.uniform4fv(colorUniformLocation, color);
  // 计算矩阵
  var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
  matrix = m4.xRotate(matrix, rotation[0]);
  matrix = m4.yRotate(matrix, rotation[1]);
  matrix = m4.zRotate(matrix, rotation[2]);
  matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
  // 设置矩阵
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
}
