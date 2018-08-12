'use strict'
const config = require('../config')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongo = mongoose.connect(config.mongourl).then(() => {
    console.log('mongodb connected to:', config.mongourl)
})
.catch(err => {
    console.log('mongodb connect error:', config.mongourl, err.message)
    process.exit(200)
})

const userSchema = Schema({
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
}, {
        timestamps: {
            createdAt: 'createdAt'
        }

})

const eventSchema = Schema({
    check: {
        type: Schema.Types.ObjectId,
        ref: 'Check',
        required: true,
        index: true,
    },
    online: {
        type: Boolean 
    },
    finish:
    {
        type: Date,
        default: null
    },
    duration:
    {
        type: Number
    }

},{
    timestamps: {
        createdAt: 'start'
    }
})

const checkSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: userSchema,
        required: true,
        index: true,
        unique: false
    },
    title: {
        type: String,
        required: true,
        unique: false
    },
    url: {
        type: String,
        required: true,
        index: true,
        unique: false
    },
    interval: {
        type: Number,
        min: 0,
        max: 300
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: eventSchema,
        index: true
    },
    online: {
        type: Boolean,
        default: true
    }
}, {
        timestamps: {
            createdAt: 'createdAt'
        }
    })

const periodicSchema = Schema({
    check: {
        type: Schema.Types.ObjectId,
        ref: checkSchema,
        required: true,
        index: true,
    },
    next: {
        type: Date,
        required: true
    }
})

const logSchema = Schema({
    check: {
        type: Schema.Types.ObjectId,
        ref: checkSchema,
        required: true,
        index: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: eventSchema,
        required: true,
        index: true
    },
    date:
    {
        type: Date,
        default: Date.now(),
        required: true,
        index: true
    },
    status: {
        type: String,
        required: true,
        index: true
    },
    duration: {
        type: Number
    },
    downloadSize: {
        type: Number
    }
})

module.exports = {
    Check: mongoose.model('Check', checkSchema),
    Log: mongoose.model('Log', logSchema),
    Periodic: mongoose.model('Periodic', periodicSchema),
    User: mongoose.model('User', userSchema),
    Event: mongoose.model('Event', eventSchema),
}

