import mongoose from 'mongoose'
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
    createdAt: {
        type: Date,
        default: Date.now()
    },
    deletedAt: {
        type: Date,
        default: null
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
    }
})


export const Check = mongoose.model('Check', checkSchema)
export const Log = mongoose.model('Log', logSchema)

