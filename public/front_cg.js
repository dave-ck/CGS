// Vertex shader program
const VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform bool u_Clicked;\n' + // Mouse is pressed
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed
    '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  } else {\n' +
    '    v_Color = a_Color;\n' +
    '  }\n' +
    '}\n';

// Fragment shader program
const FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

const ANGLE_STEP = 50.0; // Rotation angle (degrees/second)


let models = undefined;
// load STL models from serverside
$.get("./models", function (model_data) {
    models = model_data;
    console.log(models.sphere.vertices.length);
    console.log(models.threeSquares.vertices);
    console.log(models.flower.vertices.length);
});

// load a specific STL model (as JS object) into the program
function initVertexBuffersFromModel(gl, model) {
    let vertices = new Float32Array(model.vertices);
    //uint16 breaks things
    let indices = new Uint16Array(model.indices);
    let colors = new Float32Array(model.colors);
    // Create a buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer)
        return -1;

    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;

    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
        return -1;

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;
}

function main() {
    // using the 2D canvas to more easily display dev info
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    var hud = document.getElementById('hud');

    if (!canvas || !hud) {
        console.log('Failed to get HTML elements');
        return false;
    }

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    // Get the rendering context for 2DCG
    var ctx = hud.getContext('2d');
    if (!gl || !ctx) {
        console.log('Failed to get rendering context');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }


    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of uniform variables
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
    if (!u_MvpMatrix || !u_Clicked) {
        console.log('Failed to get the storage location of uniform variables');
        return;
    }

    // Calculate the view projection matrix
    var viewProjMatrix = new Matrix4();
    // may need to modify near/far values to ensure proper rendering of "large" objects
    viewProjMatrix.setPerspective(45.0, canvas.width / canvas.height, 0.2, 100.0);
    viewProjMatrix.lookAt(5.0, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked

    var currentAngle = 0.0; // Current rotation angle
    // Register the event handler
    let speed = 1;

    function tick() {   // Start drawing
        console.log("Current speed:" + speed);
        if (speed) {
            currentAngle = animate(currentAngle);
            draw2D(ctx, currentAngle); // Draw 2D
            draw(gl, currentAngle, viewProjMatrix, u_MvpMatrix);
            requestAnimationFrame(tick, canvas);
        }
    }

    // "Pause" functionality
    document.onkeydown = function (ev) {
        console.log(ev.key);
        switch (ev.key) {
            case "p":
                speed++;
                speed %= 2;
                break;
            default:
                speed = 1;
        }
        if (speed) {
            tick();
        }
    };

    tick();
}


function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([   // Colors
        0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, // v0-v1-v2-v3 front
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v1-v6-v7-v2 left
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v7-v4-v3-v2 down
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    // Write the vertex property to buffers (coordinates and normals)
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Coordinates
    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;      // Color Information

    // Create a buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, currentAngle, viewProjMatrix, u_MvpMatrix) {
    //draw stage
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }
    // Calculate The model view projection matrix and pass it to u_MvpMatrix
    g_MvpMatrix.set(viewProjMatrix);
    //g_MvpMatrix.translate(-3, -2, -5);
    g_MvpMatrix.scale(5, 0.1, 5);
    g_MvpMatrix.translate(0,-5 , 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers (color and depth)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw
    // Set the vertex information
    var n = initVertexBuffers(gl);
    // async means model may not have been loaded from "server" yet
    if (models) {
        n = initVertexBuffersFromModel(gl, models.pointy);
    }
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }
    // Calculate The model view projection matrix and pass it to u_MvpMatrix
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    g_MvpMatrix.translate(0, 1, 2);
    g_MvpMatrix.scale(.1, .1, .1);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers (color and depth)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw
    var n = initVertexBuffers(gl);
    // async means model may not have been loaded from "server" yet
}

function draw2D(ctx, currentAngle) {
    ctx.clearRect(0, 0, 400, 400); // Clear <hud>
    // Draw triangle with white lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Set white to color of lines
    ctx.stroke();                           // Draw Triangle with white lines
    // Draw white letters
    ctx.font = '18px "Times New Roman"';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
    ctx.fillText('Dev info:', 40, 20);
    ctx.fillText('Current Angle: ' + Math.floor(currentAngle), 40, 40);
    ctx.fillText('RPXP63\'s program', 40, 60);
}

let last = Date.now(); // Last time that this function was called
function animate(angle) {
    let now = Date.now();   // Calculate the elapsed time
    let elapsed = now - last;
    last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}


function initAxesVertexBuffers(gl) {

    var verticesColors = new Float32Array([
        // Vertex coordinates and color (for axes)
        -20.0, 0.0, 0.0, 1.0, 1.0, 1.0,  // (x,y,z), (r,g,b)
        20.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        0.0, 20.0, 0.0, 1.0, 1.0, 1.0,
        0.0, -20.0, 0.0, 1.0, 1.0, 1.0,
        0.0, 0.0, -20.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 20.0, 1.0, 1.0, 1.0
    ]);
    var n = 6;

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_Position, assign buffer and enable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return n;
}