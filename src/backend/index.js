'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const config = require('../../config')
const models = require('../mongo')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const auth = require('./auth')
const morgan = require('morgan')
const cors = require('cors');

const app = express()

app.use(morgan('combined'));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))
/*
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials','true')
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'content-type'
//    DNT,Keep-Alive,User-Agent,If-Modified-Since,Cache-Control Origin, Accept, Content-Type, Content-Length, Access-Control-Request-Method, x-access-token'
)
    console.log('hdr')

    if (req.method === 'OPTIONS') {
        res.sendStatus(200).end()
    }
    else {
        console.log('hdr2')
        next()
    }
})
*/
/*var corsOptions = {
    origin:'http://localhost:3000',
    optionsSuccessStatus: 200,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Origin', 'X-Requested-With', 'Accept', 'X-Access-Token'],
    credentials: false,
    preflightContinue: true
}
*/
//app.use(cors())


app.use('/auth', auth({ models, express, bcrypt, jwt, jwtToken: config.jwtToken, cors }))

app.listen(config.port, '0.0.0.0')
console.log('listen on port: ' + config.port)