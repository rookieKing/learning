
import { m4, v3 } from 'twgl.js';
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram, radToDeg, degToRad } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'
import { Cube, generateFace } from './help.js'

document.querySelector('#app').innerHTML = template;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl");
var [, program] = createProgram(gl, vertexShaderSource, fragmentShaderSource);
// attribute
var a_position = gl.getAttribLocation(program, "a_position");
// uniform
var u_worldViewProjection = gl.getUniformLocation(program, "u_worldViewProjection");
var u_texture = gl.getUniformLocation(program, "u_texture");

var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var shininess = 150;
var lightRotationX = 0;
var lightRotationY = 0;
var innerLimit = degToRad(10);
var outerLimit = degToRad(20);

// Setup a ui.
webglLessonsUI.setupSlider("#xRotation", { value: radToDeg(modelXRotationRadians), slide: updateRotationX, min: -360, max: 360 });
webglLessonsUI.setupSlider("#yRotation", { value: radToDeg(modelYRotationRadians), slide: updateRotationY, min: -360, max: 360 });
webglLessonsUI.setupSlider("#shininess", { value: shininess, slide: updateShininess, min: 1, max: 300 });
webglLessonsUI.setupSlider("#lightRotationX", { value: lightRotationX, slide: updatelightRotationX, min: -2, max: 2, precision: 2, step: 0.001 });
webglLessonsUI.setupSlider("#lightRotationY", { value: lightRotationY, slide: updatelightRotationY, min: -2, max: 2, precision: 2, step: 0.001 });
webglLessonsUI.setupSlider("#innerLimit", { value: radToDeg(innerLimit), slide: updateInnerLimit, min: 0, max: 180 });
webglLessonsUI.setupSlider("#outerLimit", { value: radToDeg(outerLimit), slide: updateOuterLimit, min: 0, max: 180 });

function updateInnerLimit(event, ui) {
  innerLimit = degToRad(ui.value);
  drawScene();
}

function updateOuterLimit(event, ui) {
  outerLimit = degToRad(ui.value);
  drawScene();
}

function updatelightRotationX(event, ui) {
  lightRotationX = ui.value;
  drawScene();
}

function updatelightRotationY(event, ui) {
  lightRotationY = ui.value;
  drawScene();
}


function updateShininess(event, ui) {
  shininess = ui.value;
  drawScene();
}

function updateRotationX(event, ui) {
  modelXRotationRadians = degToRad(ui.value);
  drawScene();
}

function updateRotationY(event, ui) {
  modelYRotationRadians = degToRad(ui.value);
  drawScene();
}

var positionBuffer = gl.createBuffer();
// 将绑定点绑定到缓冲数据（positionBuffer）
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 将几何数据存到缓冲
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.position), gl.STATIC_DRAW);
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

// 立方体贴图
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
const ctx = document.createElement("canvas").getContext("2d");
ctx.canvas.width = 128;
ctx.canvas.height = 128;
const faceInfos = [
  { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
  { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
  { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
  { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
  { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
  { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
];
faceInfos.forEach((faceInfo) => {
  const { target, faceColor, textColor, text } = faceInfo;
  generateFace(ctx, faceColor, textColor, text);
  // Upload the canvas to the cubemap face.
  const level = 0;
  const internalFormat = gl.RGBA;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  gl.texImage2D(target, level, internalFormat, format, type, ctx.canvas);
});
gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

// 启用深度缓冲
gl.enable(gl.DEPTH_TEST);
// 启用背面剔除
gl.enable(gl.CULL_FACE);
// 告诉它用我们之前写好的着色程序（一个着色器对）
gl.useProgram(program);
gl.enableVertexAttribArray(a_position);

function drawCube(aspect) {
  // 计算投影矩阵
  var zNear = 1;
  var zFar = 2000;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  // 计算相机的矩阵
  var camera = [0, 0, 2];
  var target = [0, 0, 0];
  var up = [0, 1, 0];
  var cameraMatrix = m4.lookAt(camera, target, up);
  // 通过相机矩阵计算视图矩阵
  var viewMatrix = m4.inverse(cameraMatrix);
  // 计算组合矩阵
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  var worldMatrix = m4.rotationX(modelXRotationRadians);
  worldMatrix = m4.rotateY(worldMatrix, modelYRotationRadians);
  var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
  // 设置矩阵
  gl.uniformMatrix4fv(u_worldViewProjection, false, worldViewProjectionMatrix);
  // 使用纹理 0
  gl.uniform1i(u_texture, 0);
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}

function drawScene() {
  // 告诉WebGL如何从裁剪空间映射到像素空间
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 清空画布和深度缓冲
  gl.clearColor(1, 1, 1, 1);   // clear to white
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  drawCube(aspect);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
}
window.addEventListener('resize', resize);
resize();
