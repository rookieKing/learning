
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'

// 返回 0 到 range 范围内的随机整数
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// 用参数生成矩形顶点并写进缓冲
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
 
  // 注意: gl.bufferData(gl.ARRAY_BUFFER, ...) 将会影响到
  // 当前绑定点`ARRAY_BUFFER`的绑定缓冲
  // 目前我们只有一个缓冲，如果我们有多个缓冲
  // 我们需要先将所需缓冲绑定到`ARRAY_BUFFER`
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}

document.querySelector('#app').innerHTML = template;
var canvas = document.querySelector("canvas");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

var gl = canvas.getContext("webgl");
var [, program] = createProgram(gl, vertexShaderSource, fragmentShaderSource);
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var colorUniformLocation = gl.getUniformLocation(program, "u_color");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var translation = [0, 0];
var width = 100;
var height = 30;
var color = [Math.random(), Math.random(), Math.random(), 1];

drawScene();

// Setup a ui.
webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

function updatePosition(index) {
  return function(event, ui) {
    translation[index] = ui.value;
    drawScene();
  };
}

function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 清空画布
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 告诉它用我们之前写好的着色程序（一个着色器对）
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 设置全局变量 分辨率
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  
  // 将绑定点绑定到缓冲数据（positionBuffer）
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
  var size = 2;          // 每次迭代运行提取两个单位数据
  var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
  var normalize = false; // 不需要归一化数据
  var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
  // 每次迭代运行运动多少内存到下一个数据开始点
  var offset = 0;        // 从缓冲起始位置开始读取
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)
  
  // 创建一个矩形
  // 并将写入位置缓冲
  setRectangle(
    gl, translation[0], translation[1], width, height);

  // 设置颜色
  gl.uniform4fv(colorUniformLocation, color);

  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
