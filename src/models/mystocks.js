const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')

const mystockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    id: {
        type: String,
        default: uuid.v4()
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    quantity:{
        type: Number
    },
    buyPrice:{
        type: Number
    },
    prices:[{
        id:{
            type: Number,
            default: 0
        },
        price: {
           type: [Number]
        }
    }]
}, {
    timestamps: true
})

const Mystock = mongoose.model('Mystock', mystockSchema)

module.exports = Mystock