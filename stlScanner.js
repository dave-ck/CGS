"use strict";
const fs = require("fs");

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

function lookupFacetProcess(facetString, index) {
    let facet = facetString.split(/\s/);
    let i_normal = facet.indexOf("normal");
    let normal = facet.slice(i_normal + 1, i_normal + 4).map(parseFloat);
    let i_v1 = facet.indexOf("vertex");
    let v1 = facet.slice(i_v1 + 1, i_v1 + 4).map(parseFloat);
    facet = facet.slice(i_v1 + 4);
    let i_v2 = facet.indexOf("vertex");
    let v2 = facet.slice(i_v2 + 1, i_v2 + 4).map(parseFloat);
    facet = facet.slice(i_v2 + 4);
    let i_v3 = facet.indexOf("vertex");
    let v3 = facet.slice(i_v3 + 1, i_v3 + 4).map(parseFloat);
    let vertices = v1.concat(v2).concat(v3);
    return {
        normals: normal.concat(normal).concat(normal), // need to duplicate the normal, so that
        vertices: vertices
    };
}

function devSTL(source_path) {
    let data = fs.readFileSync(source_path, 'utf-8');
    let vertices = [];
    let normals = [];
    let indices = [];       //completely redundant in this case, can be optimized if rendering per-frame becomes slow
    let colors = [];        // set colors to be = normal*255 in RGB space - temporary, should be obvious to identify if incomplete
    let facetArray = data.split("endfacet\r\n  facet");
    //console.log(facetArray.slice(0,10));
    // facet0 requires special processing - need to remove header info
    facetArray[0] = facetArray[0].slice(29);
    let indexCount = 0;
    facetArray.forEach(function (facetString, index) {
        let facet = lookupFacetProcess(facetString, index);
        vertices = vertices.concat(facet.vertices);
        normals = normals.concat(facet.normals);
        colors = colors.concat(facet.vertices.map((i) => Math.abs(i * 255)));
        indices.push(indexCount++);
        indices.push(indexCount++);
        indices.push(indexCount++);
    });
    return {normals: normals, vertices: vertices, colors: colors, indices: indices};
}

function readSTL(source_path) {
    console.log("Reading in " + source_path + "...");
    let data = fs.readFileSync(source_path, 'utf-8');
    let vertices = [];
    let normals = [];
    let indices = [];       //completely redundant in this case, can be optimized if rendering per-frame becomes slow
    let facetArray = data.split("endfacet\r\n  facet");
    //console.log(facetArray.slice(0,10));
    // facet0 requires special processing - need to remove header info
    facetArray[0] = facetArray[0].slice(29);
    let indexCount = 0;
    facetArray.forEach(function (facetString, index) {
        let facet = processFacet(facetString, index);
        vertices = vertices.concat(facet.vertices);
        normals = normals.concat(facet.normals);
        indices.push(indexCount++);
        indices.push(indexCount++);
        indices.push(indexCount++);
    });
    // normals may be wrong, but aren't causing current bug (not used in present rendering)
    return {normals: normals, vertices: vertices, indices: indices};
}


// generate a "dummy" 3D model with
function genDummy(size) {
    let vertices = [];
    let indices = [];       //completely redundant in this case, can be optimized if rendering per-frame becomes slow
    for (let i = 0.0; i < size; i++) {
        vertices = vertices.concat([i, i, i + 1, i, i + 1, i, i + 1, i, i]);
        indices.push(i * 3);
        indices.push(i * 3 + 1);
        indices.push(i * 3 + 2);
    }
    // normals may be wrong, but aren't causing current bug (not used in present rendering)
    return {vertices: vertices, indices: indices};
}

let models = JSON.parse(fs.readFileSync("./models.json", 'utf-8'));

// INSERT CODE TO ADD TO MODELS HERE i.e.
models.boat = readSTL("./STL_Sources/boat.stl");    // overwrites existing models.x


fs.writeFile("./models.json", JSON.stringify(models), null, 2);


console.log("\nDone loading models. models.json has been updated.");