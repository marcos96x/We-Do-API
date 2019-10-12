const express = require("express")
const consign = require("consign")
const app = express()

consign()
    .include("src/models")
    .then("/libs/config.js")
    .then("src/middlewares")
    .then("src/controllers")
    .then("src/routes")
    .then("/libs/boot.js")
    .into(app)

