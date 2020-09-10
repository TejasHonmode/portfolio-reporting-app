const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        // validate(value) {
        //     if(!validator.isEmail(value)){
        //         throw new Error('Email is invalid')
        //     }
        // }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
        // validate(value){
        //     if(value.toLowerCase().includes('password')){
        //         throw new Error('Password cannot contain "password"')
        //     }
        // }

    },
    balance:{
        type: Number,
        default: 100000
    },
    invested:{
        type: Number,
        default: 0
    },
    roi:{
        percentage:{
            type: Number,
            default: 0
        },
        amount:{
            type: Number,
            default: 0
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})


userSchema.virtual('mystocks', {
    ref: 'Mystock',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.toJSON = function() {
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


userSchema.methods.generateAuthToken = async function() {
    const user = this

    const token = jwt.sign({ _id: user._id.toString() }, 'portfolioreporting')

    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

//this has to be a standard function, not an arrow function
userSchema.pre('save', async function (next) {
    const user = this
    console.log('Just before saving.....')

    if(user.isModified('password')){
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next()
})


userSchema.pre('remove', async function(next) {
    const user = this

    await DidKeyPair.deleteMany({owner: user._id})

    next()

})


userSchema.statics.findByCredentials = async(email, password) => {
    // const user = this
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Wrong wallet id')
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if(!isMatch){
        throw new Error('Wrong password')
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User