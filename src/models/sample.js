const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
let count=0
const sampleSchema = new mongoose.Schema({

    name:{
        type: String
    },
   prices:[{
       id: {
           type: Number,
           default: count++
       },
       price: {
           type: [Number]
       }
   }]

}, {
    timestamps: true
})

const Sample = mongoose.model('Sample', sampleSchema)

module.exports = Sample