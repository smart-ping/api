'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const config = require('../../config')
const models = require('../mongo')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const auth = require('./auth')
const check = require('./check')

const app = express()

app.use(morgan('combined'))

app.use(cookieParser())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use('/auth', auth({ models, express, bcrypt, jwt, jwtToken: config.jwtToken, cors }))

app.use('/data', check({ models, express, jwt, jwtToken: config.jwtToken, cors }))

app.listen(config.port, '0.0.0.0')
console.log('listen on port: ' + config.port)