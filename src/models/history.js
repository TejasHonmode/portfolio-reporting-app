const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const historySchema = new mongoose.Schema({
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
    trade:{
        type: String
    },
    tradeId: {
        type: String,
        default: Str.random(21)
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    quantity:{
        type: Number
    },
    pricePerUnit:{
        type: Number
    },
    totalPrice:{
        type: Number
    }
}, {
    timestamps: true
})

const History = mongoose.model('History', historySchema)

module.exports = History