const express = require('express')
const chance = require('chance').Chance()

const User = require('../../models/user')
const Stock = require('../../models/stocks')
const Mystock = require('../../models/mystocks')

const auth = require('../../middleware/auth')

const router = new express.Router()

router.post('/addstock', auth,async(req, res) => {

    let name = req.body.name
    let quantity=req.body.quantity
    let buyPrice = req.body.buyPrice
    console.log('name quant buypr---->', name, quantity, buyPrice);
    let priceArray = await Array.from(Array(9)).map(x => chance.floating({min: buyPrice-chance.integer({min:0, max:3}), max: buyPrice+chance.integer({min:0,max:3})}))
    console.log('Price array------>', priceArray);
    let newPriceArrayLength = priceArray.unshift(buyPrice)
    console.log('New Price array------>', priceArray);
    let mystock = new Mystock({
        name,
        owner: req.user._id,
        quantity,
        buyPrice,
        prices:{
            price: priceArray
        }
    })
    console.log('Mystock----->yayaya', mystock);
    console.log('Mystock----->yayaya11111', mystock);
    await mystock.save()
    console.log('MyStock saved----------->');
    res.send({mystock, openingPrice:priceArray[0],closingPrice:priceArray[priceArray.length-1], eodReturn:`${(priceArray[priceArray.length-1] - mystock.buyPrice)*100/mystock.buyPrice}%`})


})

router.patch('/updateprice', auth, async(req, res)=>{

    let name = req.body.name
    console.log('Params---------->', name)
    let mystock = await Mystock.findOne({owner: req.user._id, name})
    console.log('Mystock--------------->', mystock);
    let lastDayPrices = mystock.prices[mystock.prices.length-1]
    console.log('Last day prices------->', lastDayPrices);
    let newOpeningPrice = lastDayPrices.price[lastDayPrices.price.length-1]
    console.log('New opening price----->', newOpeningPrice);
    let priceArray = await Array.from(Array(9)).map(x => chance.floating({min: newOpeningPrice-chance.integer({min:0, max:2}), max: newOpeningPrice+chance.integer({min:0,max:3})}))
    console.log('Price array----->', priceArray);
    let newLength = priceArray.unshift(newOpeningPrice)
    console.log('New Price array------>', priceArray);
    mystock.prices =  mystock.prices.concat({
        id: lastDayPrices.id + 1,
        price: priceArray
    })
    console.log('Updated mystock----->', mystock);
    await mystock.save()
    console.log('mystock saved------->');

    res.send({mystock, openingPrice: priceArray[0],closingPrice:priceArray[priceArray.length-1], eodReturn:`${(priceArray[priceArray.length-1]-mystock.buyPrice)*100/mystock.buyPrice}%`})
})
// router.post('/createexchange', async(req, res)=>{
    
//     console.log('in create exchange api');
//     const stock = new Stock(req.body)
//     console.log('stock json ---------->', stock);
//     try {
//         await stock.save()
//         res.send(stock)
//     } catch (e) {
//         res.send(e)
//     }
// })


// router.post('/investmentoptions', async(req, res) => {


//     try {
//         res.send({msg:'Investment options shown here'})
//     } catch (e) {
//         res.send(e)
//     }
// })



router.post('/dashboard', auth,async(req, res) => {

    try {
        let mystocks = await Mystock.find({})
        if(mystocks.length===0){
            return res.send({msg:'No Investments yet.'})
        }
        res.send(mystocks)
    } catch (e) {
        res.send(e)
    }
})

// router.get('/user/exchange', async(req, res) => {

//     try {
//         const exchange = await Stock.find({})
//         res.send(exchange)
//     } catch (e) {
//         res.send(e)
//     }
// })

// router.post('/user/txn', async(req, res) => {

//     let name = req.body.name
//     let quantity = req.body.quantity
//     let txn = req.body.txn

//     console.log('Params----->', name, quantity, txn);

//     let stock = await Stock.findOne({name})
//     console.log('stock is-------', stock);

//     let mystock = await Mystock.findOne({name}) 
//     console.log('init mystock------------>');

//     try {
//         if(txn==='buy'){
//             if(!mystock){

//                 let newQuant = stock.quantity - quantity
//                 console.log('New quant----->', newQuant);
//                 // stock.quantity = stock.quantity - quant
//                 let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant}, {useFindAndModify: false})
//                 console.log('name , id, quant----->', name, stock.id, quantity);
//                 let mystock1 = new Mystock({
//                     name,
//                     id: stock.id,
//                     quantity
//                 })
//                 console.log('my stock is-------', mystock1);
//                 // await stock.save()
//                 await mystock1.save()
//                 return res.send({
//                     updatedStock: stock,
//                     myStock: mystock1
//                 })
//             }
//             else{
//                 let newQuant = stock.quantity - quantity
//                 let mystockQuant = mystock.quantity + quantity
//                 console.log('New quant----->', newQuant);
//                 let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant}, {useFindAndModify: false})
//                 let updateMystock = await Mystock.findOneAndUpdate({name}, {quantity: mystockQuant}, {useFindAndModify: false})
//                 // await mystock.save()
//                 // await stock.save()

//                 return res.send({
//                     stock,
//                     mystock
//                 })
//             }
//         }

//         else{

//             let stockQuant = stock.quantity + quantity
//             let mystockQuant = mystock.quantity - quantity
//             let updatedStock = await Stock.findOneAndUpdate({name}, {quantity: stockQuant}, {useFindAndModify: false})
//             if(mystockQuant === 0){
//                 await Mystock.deleteOne({name})
//             }else{
//                 let updateMystock = await Mystock.findOneAndUpdate({name}, {quantity: mystockQuant}, {useFindAndModify: false})
//             }

//             return res.send({
//                 updatedStock: stock,
//                 mystock
//             })
//         }














//     //     console.log('in txn try catch---------->');
//     //     console.log('Params----->', name, quantity, txn);
        
//     //     // let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: quantity-quant}) 
//     //     if(txn == "buy"){

//     //         console.log('in if----->');
            
//     //     }else{

//     //         let newQuant = stock.quantity + quantity
//     //         console.log('New quant----->', newQuant);
//     //         let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant})
//     //         console.log('after sell stock quantity', stock.quantity);
//     //     }
//     //     await stock.save()
//     //     console.log('Stock saved---------->');

//     //     res.send({
//     //         updatedStock: stock,
//     //         myStock: mystock
//     //     })
//     } catch (e) {
//         res.send({e})
//     }
// })




module.exports = router
