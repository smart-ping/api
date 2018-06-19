'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const config = require('../../config')
const models = require('../mongo')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const auth = require('./auth')
const morgan = require('morgan')

const app = express()

app.use(morgan('combined'));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use('/auth', auth({ models, express, bcrypt, jwt, jwtToken: config.jwtToken }))

app.listen(config.port)
console.log('listen on port: ' + config.port)