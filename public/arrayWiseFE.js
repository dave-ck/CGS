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
    viewProjMatrix.lookAt(140, 55, 3, 0, 50, 20, 0, 0, 1);

    // Pass the view projection matrix to u_ViewProjMatrix
    gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

    let indices = initVertexBuffers(gl);
    // Set the vertex coordinates and color (the blue triangle is in the front)
    if (models) {
        indices = initVertexBuffersFromModels(gl, 1, 0, 1);
    }
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (models) {
        document.getElementById("space").hidden = true;
        gl.drawArrays(gl.LINES, indices.axes.start, indices.axes.len);
        draw(gl, "river", indices);
        draw(gl, "branches50", indices);
        draw(gl, "leaves50", indices);
        draw(gl, "slopes", indices);
        draw(gl, "riverBank", indices);
        draw(gl, "footPath", indices);
        draw(gl, "bridge", indices);
    } else {
        console.log("Models not yet loaded");
        gl.drawArrays(gl.TRIANGLES, indices.green.start, indices.green.end);
        gl.drawArrays(gl.TRIANGLES, indices.pointy.start, indices.pointy.len);
    }
}

function draw(gl, modelKey, indices) {
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
        -1.5, 2.59808, 0, 1, 1, 0,

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
function color(vertices, r = 0, g = 0, b = 0) {
    if (r || g || b) {
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
    } else return randColor(vertices);
}

function randColor(vertices) {
    let coloredVertices = [];
    let n = vertices.length;
    for (let i = 0; i < (n / 3); i++) {
        coloredVertices.push(vertices[i * 3]);
        coloredVertices.push(vertices[i * 3 + 1]);
        coloredVertices.push(vertices[i * 3 + 2]);
        // ensure at least (probabilistically, exactly) one of R, G, B is set to 1
        coloredVertices.push(Math.random() * 0.4 | (i + 1) % 2);
        coloredVertices.push(Math.random() * 0.4 | (i + 1) % 2);
        coloredVertices.push(Math.random() * 0.4 | (i) % 2);
    }
    return coloredVertices;
}


function initVertexBuffersFromModels(gl) {
    let concatenated = [
        // Vertex coordinates and color (for axes)
        -200.0, 0.0, 0.0, 1.0, 0, 0, //v1
        200.0, 0.0, 0.0, 1.0, 0, 0, //v2
        0.0, 200.0, 0.0, 0, 1, 0, //v3
        0.0, -200.0, 0.0, 0, 1, 0, //v4
        0.0, 0.0, -200.0, 0, 0, 1, //v5
        0.0, 0.0, 200.0, 0, 0, 1,  //v6
    ];
    let indices = {axes: {start: 0, len: 6}};
    let i = 6;
    // initialized non-empty to facilitate testing and debugging

    for (let key in models) {
        if (models.hasOwnProperty(key)) {
            let r = 0;
            let g = 0;
            let b = 0;
            switch (key) {
                case "branches50":
                    r = 158 / 255;
                    g = 115 / 255;
                    b = 17 / 255;
                    break;
                case "river":
                    r = 17 / 255;
                    g = 90 / 255;
                    b = 158 / 255;
                    break;
                case "riverBank":
                    r = 103 / 255;
                    g = 181 / 255;
                    b = 48 / 255;
                    break;
                case "leaves50":
                    r = 0 / 255;
                    g = 128 / 255;
                    b = 0 / 255;
                    break;
                case "slopes":
                    r = 34 / 255;
                    g = 139 / 255;
                    b = 34 / 255;
                    break;
                case "footPath":
                    r = 128 / 255;
                    g = 128 / 255;
                    b = 128 / 255;
                    break;
                case "bridge":
                    r = 128 / 255;
                    g = 128 / 255;
                    b = 128 / 255;
                    break;
                default:
                    console.log("Proceeding with random coloration.");
            }

            let colored = color(models[key].vertices, r, g, b);  // red by default, can use switch case to color differently
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
    console.log(verticesColors.slice(indices.river.start * 6, (indices.river.start + indices.river.len) * 6));
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
