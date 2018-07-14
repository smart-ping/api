'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongoUrl = 'mongodb://localhost/checks'

const mongo = mongoose.connect(mongoUrl).then(() => {
    console.log('mongodb connected to:', mongoUrl)
})
.catch(err => {
    console.log('mongodb connect error:', err)
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
        index: true,
    },
    date:
    {
        type: Date,
        default: Date.now(),
        required: true,
        index: true
    },
    status: {
        type: String
    },
    duration: {
        type: Number
    },
    downloadSize: {
        type: Number
    }
})

const eventSchema = Schema({
    check: {
        type: Schema.Types.ObjectId,
        ref: checkSchema,
        required: true,
        index: true,
    },
    statusUp: {
        type: Boolean 
    }
},{
    timestamps: {
        createdAt: 'createdAt'
    }
})

module.exports = {
    Check: mongoose.model('Check', checkSchema),
    Log: mongoose.model('Log', logSchema),
    Periodic: mongoose.model('Periodic', periodicSchema),
    User: mongoose.model('User', userSchema),
    Event: mongoose.model('Event', eventSchema),
}

