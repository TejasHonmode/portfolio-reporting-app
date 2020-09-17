const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const Str = require('@supercharge/strings')

const bondReturnHistorySchema = new mongoose.Schema({
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
    totalReturns:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const BondReturnHistory = mongoose.model('BondReturnHistory', bondReturnHistorySchema)

module.exports = BondReturnHistory