const express = require('express')

const User = require('../../models/user')

const auth = require('../../middleware/auth')

const router = new express.Router()

router.post('/user/signup', async(req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user, token, msg:'Signed up and logged in'})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/user/login', async(req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token, msg: 'logged in'})
    } catch (e) {
        res.send({e, msg:'Incorrect details'})
    }
})

router.post('/user/logout', auth, async(req, res) => {

    try {
        
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })

        await req.user.save()

        res.send({msg: 'Logged out'})

    } catch (e) {
        res.send(e)
    }

})

router.post('/user/logoutall', auth, async(req, res) => {

    try {
        
        req.user.tokens = []

        await req.user.save()

        res.send({msg: 'Logged out from all devices'})

    } catch (e) {
        res.send(e)
    }

})


module.exports = router