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
                break;
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
    viewProjMatrix.setPerspective(45, canvas.width / canvas.height, 1, 1000);
    viewProjMatrix.lookAt(100, 100, 20, 0, 0, 0, 0, 0, 1);

    // Pass the view projection matrix to u_ViewProjMatrix
    gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

    let indices = initVertexBuffers(gl);
    // Set the vertex coordinates and color (the blue triangle is in the front)
    if (models) {
        indices = initVertexBuffersFromModels(gl, 1, 0, 1);
    }
    // Clear color and depth buffer
    // Draw the triangles
    //gl.drawArrays(gl.TRIANGLES, 0, indices.default.end);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (models) {
        let brutePointy = [
            -1.5, 2.59808, 0, 1, 1, 0,      // pointy1
            0, 0, 10, 1, 1, 0,
            3, 0, 0, 1, 1, 0,

            -1.5, -2.59808, 0, 1, 1, 0,      // pointy2
            0, 0, 10, 1, 1, 0,
            - 1.5, 2.59808, 0, 1, 1, 0,

            3, 0, 0, 1, 1, 0,               // pointy3
            0, 0, 10, 1, 1, 0,
            -1.5, -2.59808, 0, 1, 1, 0,

            -1.5, -2.59808, 0, 1, 1, 0, // pointy4
            -1.5, 2.59808, 0, 1, 1, 0,
            3, 0, 0, 1, 1, 0,

        ];
        let modelPointy = color(models.pointy.vertices, 1,1,0);

        for(let i = 0; i < brutePointy.length; i++){
            if (brutePointy[i]!==modelPointy[i]){
                console.log(brutePointy[i]);
                console.log(modelPointy[i]);
                console.log(i);
            }
        }

        // Clear color and depth buffer
        document.getElementById("space").hidden = true;



        gl.enable(gl.POLYGON_OFFSET_FILL);
        // Draw the triangles
        gl.drawArrays(gl.TRIANGLES, indices.green.start, indices.green.len);
        gl.polygonOffset(1.0, 1.0);          // Set the polygon offset
        gl.drawArrays(gl.TRIANGLES, indices.yellow.start, indices.yellow.len);
        console.log("Drawing from " + indices.pointy.start + " for " + indices.pointy.len);
        console.log(models.pointy);
        draw(gl, "pointy", indices);
        draw(gl, "threeSquares", indices);
        draw(gl, "river", indices);
    } else {
        console.log("Models not yet loaded");
        console.log("Drawing from " + indices.green.start + " for " + indices.green.len);
        gl.drawArrays(gl.TRIANGLES, indices.green.start, indices.green.end);
        gl.drawArrays(gl.TRIANGLES, indices.pointy.start, indices.pointy.len);
    }
}

function draw(gl, modelKey, indices, r, g, b){
    gl.drawArrays(gl.TRIANGLES, indices[modelKey].start, indices[modelKey].len);
}


function initVertexBuffers(gl) {
    // keep so something is rendered when models don't load - can make generic text or smth.

    let i = 0;
    let indices = {};

    var verticesColors = new Float32Array([
        // Vertex coordinates and color
        0.0, 2.5, -5.0, 0.4, 1.0, 0.4, // The green triangle
        -2.5, -2.5, -5.0, 0.4, 1.0, 0.4,
        2.5, -2.5, -5.0, 1.0, 0.4, 0.4,

        0.0, 3.0, -5.0, 1.0, 0.4, 0.4, // The yellow triangle
        -3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
        3.0, -3.0, -5.0, 1.0, 1.0, 0.4,

        -1.5, 2.59808, 0, 1, 1, 0,      // pointy1
        0, 0, 10, 1, 1, 0,
        3, 0, 0, 1, 1, 0,

        -1.5, -2.59808, 0, 1, 1, 0,      // pointy2
        0, 0, 10, 1, 1, 0,
        - 1.5, 2.59808, 0, 1, 1, 0,

        3, 0, 0, 1, 1, 0,               // pointy3
        0, 0, 10, 1, 1, 0,
        -1.5, -2.59808, 0, 1, 1, 0,

        -1.5, -2.59808, 0, 1, 1, 0, // pointy4
        -1.5, 2.59808, 0, 1, 1, 0,
        3, 0, 0, 1, 1, 0,

    ]);

    indices = {green: {start: 0, len: 3}, yellow: {start: 3, len: 3}, pointy: {start: 6, len: 12}};

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

    return indices;
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
        coloredVertices.push(vertices[i * 3]);
        coloredVertices.push(vertices[i * 3 + 1]);
        coloredVertices.push(vertices[i * 3 + 2]);
        coloredVertices.push(r);
        coloredVertices.push(g);
        coloredVertices.push(b);
    }
    return coloredVertices;
}

function randColor(vertices){
    let coloredVertices = [];
    let n = vertices.length;
    let state = 0;
    for (let i = 0; i < (n / 3); i++) {
        coloredVertices.push(vertices[i * 3]);
        coloredVertices.push(vertices[i * 3 + 1]);
        coloredVertices.push(vertices[i * 3 + 2]);
        // ensure at least (probabilistically, exactly) one of R, G, B is set to 1
        coloredVertices.push(Math.random()*0.4 | (i+1)%2);
        coloredVertices.push(Math.random()*0.4 | (i+1)%2);
        coloredVertices.push(Math.random()*0.4 | (i)%2);
    }
    return coloredVertices;
}


function initVertexBuffersFromModels(gl, r, g, b) {
    let concatenated = [
        // Vertex coordinates and color
        0.0, 2.5, -5.0, 0.4, 1.0, 0.4, // The green triangle
        -2.5, -2.5, -5.0, 0.4, 1.0, 0.4,
        2.5, -2.5, -5.0, 1.0, 0.4, 0.4,

        0.0, 3.0, -5.0, 1.0, 0.4, 0.4, // The yellow triangle
        -3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
        3.0, -3.0, -5.0, 1.0, 1.0, 0.4,


    ];
    let indices = {green: {start: 0, len: 3}, yellow: {start: 3, len: 3}};
    let i = 6;

    for (let key in models) {
        if (models.hasOwnProperty(key)) {
            let colored = randColor(models[key].vertices);  // red by default, can use switch case to color differently
            concatenated = concatenated.concat(colored);
            indices[key] = {};
            indices[key].start = i;
            indices[key].len = colored.length / 6;
            i += colored.length / 6;
        }
    }
    //console.log(concatenated.slice(indices.pointy.start, indices.pointy.len + indices.pointy.start));
    var verticesColors = new Float32Array(concatenated);
    console.log("VerticesColors:");
    console.log(verticesColors);
    console.log("" + indices.river.start + "," + indices.river.len);
    console.log(verticesColors.slice(indices.river.start*6,  (indices.river.start + indices.river.len)*6));
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

    return indices;
}
