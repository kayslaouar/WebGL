document.querySelector('html').style.backgroundColor = 'black';
const canvas = document.querySelector('canvas');
canvas.width = 500;
canvas.height = 500;
const gl = canvas.getContext('webgl');

// obtained vertex data of tetrahedron from: https://github.com/cmpsci373/sample_models/blob/main/js/tetra.js
const verts = 12;
const vertices = [
  [0, 0, 1],
  [0.942809, 0, -0.3333333],
  [-0.4714045, 0.8164966, -0.3333333],
  [-0.4714045, -0.8164966, -0.3333333]
];

const faces = [
  [vertices[0], vertices[1], vertices[2]],
  [vertices[0], vertices[2], vertices[3]],
  [vertices[3], vertices[2], vertices[1]],
  [vertices[3], vertices[1], vertices[0]]
];

const vertexData = [];

for (let f = 0; f < faces.length; ++f) {
  for (let v = 0; v < faces[0].length; ++v) {
    vertexData.push(...faces[f][v]);
  }
}

const colors = { red: [1, 0, 0], blue: [0, 1, 0], green: [0, 0, 1], yellow: [1, 1, 0], magenta: [1, 0, 1], cyan: [0, 1, 1] };
const colorData = [];
// must have a total of 12 iterations because we need to apply a color to every vertex and we have 12 vertices in the tetrahedron!
for (let i = 0; i < 2; ++i) {
  for (const color in colors) {
    colorData.push(...colors[color]);
  }
}

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

vertexShaderSourceCode = `
  precision lowp float;
  attribute vec4 position;
  attribute vec4 color;
  varying vec4 vColor;
  uniform mat4 matrix;
  void main() {
    vColor = color;
    gl_Position = matrix * position;
  }
`;

fragmentShaderSourceCode = `
  precision lowp float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
// create shaders
gl.shaderSource(vertexShader, vertexShaderSourceCode);
gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
// load shader source code to gl context
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
//compile shaders

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionAttribute = gl.getAttribLocation(program, 'position'); // second parameter is name of position variable in GLSL shader source ode
gl.enableVertexAttribArray(positionAttribute); // all attribtues are disabled by default
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

const colorAttribute = gl.getAttribLocation(program, 'color');
gl.enableVertexAttribArray(colorAttribute); // all attribtues are disabled by default
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program); // tell GPU which program to execute
gl.enable(gl.DEPTH_TEST); 
// ESSENTIAL! without this, you get weird results where hidden objects are rendered. 
// Need to render closest objects and hide obstructed ones.

const matrix = mat4.create();
mat4.rotateX(matrix, matrix, 0.25); // tilt the tetrahedron

function animate() {
  requestAnimationFrame(animate);
  mat4.rotateY(matrix, matrix, 0.01); // constant rotation of the tetrahedron around the y-axis
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'matrix'), false, matrix); 
  gl.drawArrays(gl.TRIANGLES, 0, verts); // redraws position of everything based on new transformed positions. uses program
}

animate();
