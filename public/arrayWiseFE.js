// Zfighting.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ViewProjMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

let models = undefined;
// load STL models from serverside
$.get("./models", function (model_data) {
    models = model_data;
    console.log(models.pointy);
});


function main() {
    document.onkeydown = function (ev) {
        console.log(ev.key);
        switch (ev.key) {
            case " ":
                main();
                break;
            default:
                main();
        }
    };
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex coordinates and color (the blue triangle is in the front)
    var n = initVertexBuffers(gl);
    if (models) {
        n = initVertexBuffersFromModel(gl, models.threeSquares);
    }
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    //Set clear color and enable the hidden surface removal function
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of u_ViewProjMatrix
    var u_ViewProjMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjMatrix');
    if (!u_ViewProjMatrix) {
        console.log('Failed to get the storage locations of u_ViewProjMatrix');
        return;
    }

    var viewProjMatrix = new Matrix4();
    // Set the eye point, look-at point, and up vector.
    viewProjMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    viewProjMatrix.lookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0);

    // Pass the view projection matrix to u_ViewProjMatrix
    gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Enable the polygon offset function
    gl.enable(gl.POLYGON_OFFSET_FILL);
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n / 2);   // The green triangle
    gl.polygonOffset(1.0, 1.0);          // Set the polygon offset
    gl.drawArrays(gl.TRIANGLES, n / 2, n / 2); // The yellow triangle
}



function paramdMain(backRGBA={r:0, g:0, b:0, a:1}, lookAtPar={ix:3.06, iy:2.5, iz:10.0, cx:0, cy:0, cz:-2, ux:0, uy:1, uz:0}) {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex coordinates and color (the blue triangle is in the front)
    var n = initVertexBuffers(gl);
    if (models) {
        n = initVertexBuffersFromModel(gl, models.cube64);
    }
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    //Set clear color and enable the hidden surface removal function

    gl.clearColor(backRGBA.r, backRGBA.g, backRGBA.b, backRGBA.a);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of u_ViewProjMatrix
    var u_ViewProjMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjMatrix');
    if (!u_ViewProjMatrix) {
        console.log('Failed to get the storage locations of u_ViewProjMatrix');
        return;
    }

    var viewProjMatrix = new Matrix4();
    // Set the eye point, look-at point, and up vector.
    viewProjMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    viewProjMatrix.lookAt(lookAtPar.ix, lookAtPar.iy, lookAtPar.iz, lookAtPar.cx, lookAtPar.cy, lookAtPar.cz, lookAtPar.ux, lookAtPar.uy, lookAtPar.uz);

    // Pass the view projection matrix to u_ViewProjMatrix
    gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Enable the polygon offset function
    gl.enable(gl.POLYGON_OFFSET_FILL);
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n / 2);   // The green triangle
    gl.polygonOffset(1.0, 1.0);          // Set the polygon offset
    gl.drawArrays(gl.TRIANGLES, n / 2, n / 2); // The yellow triangle

}

function initVertexBuffers(gl) {
    // keep so something is rendered when models don't load - can make generic text or smth.

    var verticesColors = new Float32Array([
        // Vertex coordinates and color
        0.0, 2.5, -5.0, 0.4, 1.0, 0.4, // The green triangle
        -2.5, -2.5, -5.0, 0.4, 1.0, 0.4,
        2.5, -2.5, -5.0, 1.0, 0.4, 0.4,

        0.0, 3.0, -5.0, 1.0, 0.4, 0.4, // The yellow triangle
        -3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
        3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
    ]);
    var n = 6;

    // Create a buffer object
    var vertexColorbuffer = gl.createBuffer();
    if (!vertexColorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}


/** @return Array consisting of input set of vertices with r,g,b interleaved;
 * v0x, v0y, v0z, r,g,b
 * v1x, v1y, v1z, r,g,b
 * ...
 * */
function color(vertices, r, g, b) {
    let coloredVertices = [];
    n = vertices.length;
    for (let i = 0; i < (n / 3); i++) {
        coloredVertices.push(vertices[i*3]);
        coloredVertices.push(vertices[i*3 + 1]);
        coloredVertices.push(vertices[i*3 + 2]);
        coloredVertices.push(r);
        coloredVertices.push(g);
        coloredVertices.push(b);
    }
    return coloredVertices;
}


function initVertexBuffersFromModel(gl, model) {
    var verticesColors = new Float32Array(color(model.vertices, 0.4, 1, 0.4));
    var n = verticesColors.length / 6;

    // Create a buffer object
    var vertexColorbuffer = gl.createBuffer();
    if (!vertexColorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}
