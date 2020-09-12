const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const mystockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stockType:{
        type: String
    },
    stockId: {
        type: String
    },
    // tradeId: {
    //     type: String,
    //     default: Str.random(21)
    // },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    quantity:{
        type: Number,
        default: 0
    },
    buyPrice:{
        type: Number
    },
    totalInvestment:{
        type: Number
    },
    // sellPrice:{
    //     type: Number
    // },
    totalReturns:{
        type: Number
    },
    // prices:[{
    //     day:{
    //         type: Number,
    //         default: 0
    //     },
    //     price: {
    //        type: [Number]
    //     },
    //     oneDayChange:{
    //         type: Number
    //     },
    //     roi:{
    //         type: Number
    //     },
    //     currentValue:{
    //         type: Number
    //     }
    // }]
}, {
    timestamps: true
})

const Mystock = mongoose.model('Mystock', mystockSchema)

module.exports = Mystock