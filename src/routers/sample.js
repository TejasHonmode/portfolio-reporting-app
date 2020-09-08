const express = require('express')
const router = new express.Router()
const Sample = require('../models/sample')

const chance = require('chance').Chance()

router.post('/sample', async(req, res)=>{
    const price=[1,2,3,4, 5]
    const sample = new Sample({
        name: 'Tejas',
        prices:{
            price:[1,2,3,5,9]
        }
    })
    console.log('pushed');
    await sample.save()
    // sample.prices.concat([price])
    // console.log('After concat------>', sample);
    // await sample.save()
    console.log('saved');
    let price1 = await Array.from(Array(10)).map(x => chance.floating({min: 48, max: 50}))
    console.log('Price-----> 1', price1);
    console.log('Yayayaa---->',price1.unshift(10))
    console.log('New price1--------->', price1);
    res.send(sample)
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