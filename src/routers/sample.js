const express = require('express')
const router = new express.Router()
const Sample = require('../models/sample')

const chance = require('chance').Chance()

router.post('/sample', async(req, res)=>{

    date1 = new Date("05 September 2019")
    console.log('date1', date1);
    date2 = new Date("5 September 2019")
    console.log('date2', date2);
    console.log((date2-date1)/(1000*60*60*24));
    console.log(07 === 7);
})

router.post('/latest', async(req, res)=> {

    console.log();
})

router.post('/upd', async(req, res) => {

    let samp = await Sample.findOne({'prices.id':0})
    console.log('Samp', samp);
    samp.prices.push({
        id:1,
        price:[1,2,3,4,5]
    })
    await samp.save()
    res.send(samp)
})

module.exports = router