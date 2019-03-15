// Zfighting.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_mvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_mvpMatrix * a_Position;\n' +
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
document.getElementById("hello").hidden = true;

// load STL models from serverside
$.get("./models", function (model_data) {
    models = model_data;
    document.getElementById("info").hidden = true;
    document.getElementById("hello").hidden = false;

    main();

});

let last = Date.now();
let ANGLE_DELTA = 0.03; //controls rate at which viewpoint turns
let indices = null;
let eyeX = 0;
let eyeY = 50;
let eyeZ = 10;
let lookAlongX = 1;
let lookAlongY = 0;
//let lookAlongZ = 0;   //unused
let look_Angle = 0;     // in radians (JS Math package uses)

function keydown(ev, gl, u_ViewProjMatrix, u_ModelMatrix) {
    console.log(ev.key);
    lookAlongX = Math.cos(look_Angle);
    lookAlongY = Math.sin(look_Angle);
    switch (ev.key) {
        case " ":
            eyeZ++;
            break;
        case "x":
            eyeZ--;
            break;
        case "q":   // look left
            look_Angle += ANGLE_DELTA;
            break;
        case "e":   // look right
            look_Angle -= ANGLE_DELTA;
            break;
        case "w":   // move forward
            eyeX += Math.cos(look_Angle);
            eyeY += Math.sin(look_Angle);
            break;
        case "a":   // move left
            eyeX += Math.cos(look_Angle + Math.PI / 2);
            eyeY += Math.sin(look_Angle + Math.PI / 2);
            break;
        case "d":   // move right
            eyeX += Math.cos(look_Angle - Math.PI / 2);
            eyeY += Math.sin(look_Angle - Math.PI / 2);
            break;
        case "s":   // move back
            eyeX -= Math.cos(look_Angle);
            eyeY -= Math.sin(look_Angle);
            break;
        default:
            break;
    }

    // keep user inside the box
    eyeZ = Math.min(eyeZ, 15);
    eyeZ = Math.max(eyeZ, 1);
    eyeX = Math.max(eyeX, 1);
    eyeX = Math.min(eyeX, 200);
    eyeY = Math.max(eyeY, 1);
    eyeY = Math.min(eyeY, 100);
    // Draw the scene
    //draw(gl, u_ViewProjMatrix, u_ModelMatrix);
}

function main() {

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
    var u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');

    // Pass the view projection matrix to u_ViewProjMatrix

    indices = initVertexBuffersFromModels(gl, 1, 0, 1);

    document.onkeydown = function (ev) {
        keydown(ev, gl, u_mvpMatrix); //, u_ModelMatrix, u_NormalMatrix, u_isLighting);
    };
    var tick = function() {
        draw(gl, u_mvpMatrix);
        requestAnimationFrame(tick);
    };
    tick();
}

function draw(gl, u_mvpMatrix) {
    let viewMatrix = new Matrix4();
    let projMatrix = new Matrix4();
    let mvpMatrix = new Matrix4();
    let modelMatrix = new Matrix4();
    projMatrix.setPerspective(45, 800 / 600, 1, 1000);
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, eyeX + lookAlongX, eyeY + lookAlongY, eyeZ, 0, 0, 1);
    //gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);
    modelMatrix.setTranslate(0, 0, 0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, indices.axes.start, indices.axes.len);
    drawModel(gl, "river", indices);
    drawModel(gl, "branches1", indices);
    drawModel(gl, "leaves1", indices);
    drawModel(gl, "branches2", indices);
    drawModel(gl, "leaves2", indices);
    drawModel(gl, "slopes", indices);
    drawModel(gl, "riverBank", indices);
    drawModel(gl, "footPath", indices);
    drawModel(gl, "bridge", indices);


    // MOVEMENT FOR THE BOAT
    let t = Date.now() % 30000;
    // boat position is a function of time; loops (teleports back to start) every 30 seconds
    let boatX = 45+ 100*t/30000;
    modelMatrix.setTranslate(boatX, 40, 1.3);
    modelMatrix.scale(.5,.5,.5);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    drawModel(gl, "boat", indices);
    drawModel(gl, "oar", indices);
}


function drawModel(gl, modelKey, indices) {
    gl.drawArrays(gl.TRIANGLES, indices[modelKey].start, indices[modelKey].len);
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
                case "branches1":
                    r = 158 / 255;
                    g = 115 / 255;
                    b = 17 / 255;
                    break;
                case "branches2":
                    r = 66 / 255;
                    g = 37 / 255;
                    b = 24 / 255;
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
                case "leaves1":
                    r = 0 / 255;
                    g = 128 / 255;
                    b = 0 / 255;
                    break;
                case "leaves2":
                    r = 34 / 255;
                    g = 139 / 255;
                    b = 34 / 255;
                    break;
                case "slopes":
                    r = 86 / 255;
                    g = 140 / 255;
                    b = 33 / 255;
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
                case "oar":
                case "boat":
                    r = 196 / 255;
                    g = 196 / 255;
                    b = 196 / 255;
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
