
import { m4, v3 } from 'twgl.js';
import vertexShaderSource from './glsl/vertex-shader-2d.glsl?raw';
import fragmentShaderSource from './glsl/fragment-shader-2d.glsl?raw';
import { createProgram, radToDeg, degToRad } from './utils.js';
import template from './template/index.html?raw';
import './webgl-tutorials.css'
import './webgl-lessons-ui.js'
import { charF } from './help.js'

document.querySelector('#app').innerHTML = template;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl");
var [, program] = createProgram(gl, vertexShaderSource, fragmentShaderSource);
// attribute
var a_position = gl.getAttribLocation(program, "a_position");
var a_texcoord = gl.getAttribLocation(program, "a_texcoord");
var a_normal = gl.getAttribLocation(program, "a_normal");
// uniform
var u_worldViewProjection = gl.getUniformLocation(program, "u_worldViewProjection");
var u_worldInverseTranspose = gl.getUniformLocation(program, "u_worldInverseTranspose");
var u_texture = gl.getUniformLocation(program, "u_texture");
var u_colorMult = gl.getUniformLocation(program, "u_colorMult");
var u_lightWorldPosition = gl.getUniformLocation(program, "u_lightWorldPosition");
var u_viewWorldPosition = gl.getUniformLocation(program, "u_viewWorldPosition");
var u_world = gl.getUniformLocation(program, "u_world");
var u_shininess = gl.getUniformLocation(program, "u_shininess");
var u_lightColor = gl.getUniformLocation(program, "u_lightColor");
var u_specularColor = gl.getUniformLocation(program, "u_specularColor");
var u_lightDirection = gl.getUniformLocation(program, "u_lightDirection");
var u_innerLimit = gl.getUniformLocation(program, "u_innerLimit");
var u_outerLimit = gl.getUniformLocation(program, "u_outerLimit");

var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var shininess = 150;
var lightRotationX = 0;
var lightRotationY = 0;
var lightDirection = [0, 0, 1];
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
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charF.position), gl.STATIC_DRAW);
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

// 给颜色创建一个缓冲
var texcoordBuffer = gl.createBuffer();
// 绑定颜色缓冲
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
// 将颜色值传入缓冲
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charF.texcoord), gl.STATIC_DRAW);
// 以浮点型格式传递纹理坐标
gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 0, 0);

// 创建缓冲存储法向量
var normalBuffer = gl.createBuffer();
// 绑定到 ARRAY_BUFFER (可以看作 ARRAY_BUFFER = normalBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// 将法向量存入缓冲
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charF.normal), gl.STATIC_DRAW);
// 告诉法向量属性怎么从 normalBuffer (ARRAY_BUFFER) 中读取值
gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

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
// 启用法向量属性
gl.enableVertexAttribArray(a_normal);

function drawF(aspect) {
  // 计算投影矩阵
  var zNear = 1;
  var zFar = 2000;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  // 计算相机的矩阵
  var camera = [0, 0, 300];
  var target = [0, 35, 0];
  var up = [0, 1, 0];
  var cameraMatrix = m4.lookAt(camera, target, up);
  // 通过相机矩阵计算视图矩阵
  var viewMatrix = m4.inverse(cameraMatrix);
  // 计算组合矩阵
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  var worldMatrix = m4.rotationX(modelXRotationRadians);
  worldMatrix = m4.rotateY(worldMatrix, modelYRotationRadians);
  var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = m4.inverse(worldMatrix);
  var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
  // 设置矩阵
  gl.uniformMatrix4fv(u_worldViewProjection, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(u_worldInverseTranspose, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(u_world, false, worldMatrix);
  // 使用纹理 0
  gl.uniform1i(u_texture, 0);
  gl.uniform4fv(u_colorMult, [1, 1, 1, 1]);
  // 设置光源位置
  const lightPosition = [40, 60, 120];
  gl.uniform3fv(u_lightWorldPosition, lightPosition);
  // 设置相机位置
  gl.uniform3fv(u_viewWorldPosition, camera);
  // 设置亮度
  gl.uniform1f(u_shininess, shininess);
  // 聚光灯指向 F
  {
    var lmat = m4.lookAt(lightPosition, target, up);
    lmat = m4.multiply(m4.rotationX(lightRotationX), lmat);
    lmat = m4.multiply(m4.rotationY(lightRotationY), lmat);
    // lookAt -Z 轴
    lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
  }
  gl.uniform3fv(u_lightDirection, lightDirection);
  gl.uniform1f(u_innerLimit, Math.cos(innerLimit));
  gl.uniform1f(u_outerLimit, Math.cos(outerLimit));
  // 设置光照颜色
  gl.uniform3fv(u_lightColor, v3.normalize([1, 0.6, 0.6]));  // 红光
  // 设置高光颜色
  gl.uniform3fv(u_specularColor, v3.normalize([1, 0.6, 0.6]));  // 红光
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
}

function drawScene() {
  // 告诉WebGL如何从裁剪空间映射到像素空间
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 清空画布和深度缓冲
  gl.clearColor(1, 1, 1, 1);   // clear to white
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  drawF(aspect);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
}
window.addEventListener('resize', resize);
resize();
