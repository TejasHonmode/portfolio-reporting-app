const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')


const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    id: {
        type: String,
        default: uuid.v4()
    },
    // price:{
    //     type:[Number]
    // },
    quantity:{
        type: Number,
        default: 1000
    }
}, {
    timestamps: true
})

const Stock = mongoose.model('Stock', stockSchema)

module.exports = Stock