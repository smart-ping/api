'use strict'
const mongoose = require('mongoose')
const mongoUrl= 'mongodb://localhost/checks'

const mongo = mongoose.connect(mongoUrl)

const checkSchema = mongoose.Schema({
    url: {
        type: String, 
        required:true,
        index: true,
        unique: true 
    },
    interval: {
        type: Number,
        min: 0,
        max: 300
    },
    deletedAt: {
        type: Date,
        default: null
    }},{
    timestamps: {
        createdAt: 'createdAt' 
    }
})

const periodicSchema = mongoose.Schema({
    check: {
        type: mongoose.Schema.Types.ObjectId,
        ref: checkSchema, 
        required: true,
        index: true,
    },
    next: {
        type: Date,
        required: true
    }
})

const logSchema = mongoose.Schema({
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: checkSchema, 
        required: true,
        index: true,
    },
    date:
    {
        type: Date,
        default: Date.now(),
        required: true
    },
    status : {
        type: String
    },
    duration: {
        type: Number
    },
    downloadSize: {
        type: Number
    }
})

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true 
    },
    password:
    {
        type: String,
        required: true
    }
})

module.exports = {
    Check: mongoose.model('Check', checkSchema),
    Log: mongoose.model('Log', logSchema),
    Periodic: mongoose.model('Periodic', periodicSchema),
    User: mongoose.model('User',userSchema)
}

