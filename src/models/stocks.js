const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stockType:{
        type: String
    },
    stockId: {
        type: String,
        default: Str.random(21)
    },
    // price:{
    //     type:[Number]
    // },
    prices:{
        type:[Number]
    }
}, {
    timestamps: true
})

const Stock = mongoose.model('Stock', stockSchema)

module.exports = Stock