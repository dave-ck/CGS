"use strict";
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));


let models = JSON.parse(fs.readFileSync("./models.json", 'utf-8'));


app.get('/models', function (request, response) {
    response.send(models);
});

const port = process.env.PORT || 8080;
app.listen(port);


console.log("\nDone loading models. Ready to .get().");