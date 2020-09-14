const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const bondSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stockType:{
        type: String,
        default: 'bond'
    },
    stockId: {
        type: String,
        default: Str.random(12)
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    quantity:{
        type: Number,
    },
    buyPrice:{
        type: Number
    },
    buyPriceDirty:{
        type: Number
    },
    // totalInvestment:{
    //     type: Number
    // },
    totalReturns:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Bond = mongoose.model('Bond', bondSchema)

module.exports = Bond