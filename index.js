"use strict";
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

function processFacet(facetString, index) {
    let facet = facetString.split(/\s/);
    let normal = facet.slice(2, 5).map(parseFloat);
    let v1 = facet.slice(20, 23).map(parseFloat);
    let v2 = facet.slice(31, 34).map(parseFloat);
    let v3 = facet.slice(42, 45).map(parseFloat);
    let vertices = v1.concat(v2).concat(v3);
    return {
        normals: normal.concat(normal).concat(normal), // need to duplicate the normal, so that
        vertices: vertices
    };
}

function readSTL(source_path) {
    let data = fs.readFileSync(source_path, 'utf-8');
    let vertices = [];
    let normals = [];
    let indices = [];       //completely redundant in this case, can be optimized if rendering per-frame becomes slow
    let colors = [];        // set colors to be = normal*255 in RGB space - temporary, should be obvious to identify if incomplete
    let x1 = data.slice(data.indexOf("vertex") + 7, (data.indexOf("vertex") + 15));
    let facetArray = data.split("endfacet\r\n  facet");
    //console.log(facetArray.slice(0,10));
    // facet0 requires special processing - need to remove header info
    facetArray[0] = facetArray[0].slice(29);
    let indexCount = 0;
    facetArray.forEach(function (facetString, index) {
        let facet = processFacet(facetString, index);
        vertices = vertices.concat(facet.vertices);
        normals = normals.concat(facet.normals);
        colors = colors.concat(facet.normals.map((i) => Math.abs(i * 255)));
        indices.push(indexCount++);
        indices.push(indexCount++);
        indices.push(indexCount++);
    });


    return {normals: normals, vertices: vertices, colors: colors, indices: indices};
}

let models = {
    pointy: readSTL("./STL_Sources/pointy.stl"),
    flower: readSTL("./STL_Sources/flower.stl"),
    gear1: readSTL("./STL_Sources/gear1.stl")
};


app.get('/models', function (request, response) {
    response.send(models);
});

const port = process.env.PORT || 8080;
app.listen(port);

