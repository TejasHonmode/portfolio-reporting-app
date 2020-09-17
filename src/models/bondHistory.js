const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const bondHistorySchema = new mongoose.Schema({
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
        type: String
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // quantity:{
    //     type: Number,
    // },
    trade:{
        type: String
    },
    price:{
        type: Number
    },
    priceDirty:{
        type: Number
    }
    // totalInvestment:{
    //     type: Number
    // },
    // totalReturns:{
    //     type: Number,
    //     default: 0
    // }
}, {
    timestamps: true
})

const BondHistory = mongoose.model('BondHistory', bondHistorySchema)

module.exports = BondHistory