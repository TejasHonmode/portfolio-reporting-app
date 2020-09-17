const express = require('express')
const chance = require('chance').Chance()
const pdf = require('pdf-creator-node')
// const pdf = require('pdfkit')
// const fs = require('fs')
const fs = require('fs-extra')
const puppeteer = require('puppeteer')


const User = require('../../models/user')
const Stock = require('../../models/stocks')
const Mystock = require('../../models/mystocks')
const History = require('../../models/history')
const Bond = require('../../models/bonds')
const BondHistory = require('../../models/bondHistory')
const BondReturnHistory = require('../../models/bondReturnHistory')

const auth = require('../../middleware/auth')
const { MaxKey } = require('mongodb')

const Str = require('@supercharge/strings')
const { findOne } = require('../../models/bonds')
const { output } = require('pdfkit')


const router = new express.Router()

router.post('/createstock', async(req,res)=>{   

    let name = req.body.name
    let stockType = req.body.stockType
    let relPrice = req.body.relPrice
    let flux = req.body.flux

    try {
        let prices = await Array.from(Array(366)).map(x => chance.floating({min: relPrice-chance.floating({min:0, max:flux}), max: relPrice+chance.floating({min:0,max:flux})}))

        let stock = new Stock({
            name,
            stockType,
            prices
        })
        await stock.save()

        res.send({
            stock,
            openingPrices: prices.slice(0,365),
            closingPrices: prices.slice(-365),
            len: prices.length
        })

    } catch (e) {
        res.send(e)
    }

})

router.get('/showstocks', async(req,res)=>{

    try {
        let stocks = await Stock.find({})
        res.send(stocks)
    } catch (e) {
        res.send(e)
    }
})


router.post('/transaction', auth,async(req, res) => {

    let name = req.body.name
    let quantity=req.body.quantity
    let trade = req.body.trade
    let price = req.body.price
    let date = req.body.date
    date = date.split('/')
    let months={'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'}
    // let stockType = req.body.stockType
    console.log('name quant buypr---->', name, quantity, trade, date);
    console.log(`${date[0]} ${months[date[1]]} ${date[2]}`);
    let date1 = new Date(`${date[0] } ${months[date[1]]} ${date[2]}`)
    console.log('date1----------->',date1);
    let date0 = new Date("1 January 2019")
    console.log('date0----------->', date0);
    let doy = (date1 - date0)/(1000*60*60*24)
    console.log('DOY----------->', doy);
    let stock = await Stock.findOne({name})
    console.log('STOCK------------->', stock);
    let mystock = await Mystock.findOne({name, owner:req.user._id})
    console.log('mystock------------------>',mystock);
    if(!mystock){

        mystock= new Mystock({
            name,
            stockType: stock.stockType,
            stockId: stock.stockId,
            owner: req.user._id,
            quantity,
            buyPrice: price,
            totalInvestment: quantity*price,
            totalReturns: (stock.prices[doy+1] - price)*quantity
        })
        await mystock.save()
        console.log('mystock saved.....');

        let mystocks = await Mystock.find({owner: req.user._id})
        let totalInv = 0
        let avgPrice = 0
        let totalStocks = 0
        let totalReturn = 0
        for(var i=0;i<mystocks.length;i++){

            totalStocks = totalStocks + mystocks[i].quantity
            totalReturn = totalReturn + mystocks[i].totalReturns
        }

        req.user.invested = req.user.invested + quantity*price
        req.user.balance = req.user.balance - quantity*price
        req.user.buyPrice = req.user.invested/totalStocks
        req.user.roi.totalReturns = totalReturn
        req.user.roi.percentage = req.user.roi.totalReturns/req.user.invested
        await req.user.save()
        console.log('user saved------');

        let history = new History({
            name,
            stockType:stock.stockType,
            stockId: stock.stockId,
            trade,
            owner: req.user._id,
            quantity,
            pricePerUnit: price,
            totalAmount: quantity*price,
            date: date1
        })
        await history.save()
        console.log('History saved -------');
        return res.send({
            mystock,
            user: req.user,
            history
        })
    }
    else if(mystock && trade==='buy'){

        mystock.quantity = quantity+mystock.quantity,
        mystock.totalInvestment = mystock.totalInvestment + quantity*price,
        mystock.buyPrice = mystock.totalInvestment / mystock.quantity
        mystock.totalReturns = (stock.prices[doy+1]*mystock.quantity) - mystock.totalInvestment
        await mystock.save()
        console.log('mystock saved ----------');

        let mystocks = await Mystock.find({owner: req.user._id})
        let totalInv = 0
        let avgPrice = 0
        let totalStocks = 0
        let totalReturn = 0
        for(var i=0;i<mystocks.length;i++){

            totalStocks = totalStocks + mystocks[i].quantity
            totalReturn = totalReturn + mystocks[i].totalReturns
        }

        req.user.invested = req.user.invested + quantity*price
        req.user.balance = req.user.balance - quantity*price
        req.user.buyPrice = req.user.invested/totalStocks
        req.user.roi.totalReturns = totalReturn
        req.user.roi.percentage = req.user.roi.totalReturns/req.user.invested
        await req.user.save()
        console.log('user saved--------------');

        let history = new History({
            name,
            stockType: stock.stockType,
            stockId: stock.stockId,
            trade,
            owner: req.user._id,
            quantity,
            pricePerUnit: price,
            totalAmount: quantity*price,
            date: date1
        })
        await history.save()

        return res.send({
            mystock,
            user: req.user,
            history
        })
    }

    else if(mystock && trade==='sell'){

        // let mystocks = await Mystock.find({})
        mystock.quantity = mystock.quantity - quantity

        if(mystock.quantity === 0){
            

            let history = new History({
                name,
                stockType: stock.stockType,
                stockId: stock.stockId,
                trade,
                owner: req.user._id,
                quantity,
                pricePerUnit: price,
                totalAmount: quantity*price,
                date: date1
            })
            await history.save()
            let del = await Mystock.findOneAndDelete({name, owner: req.user._id})

            let mystocks = await Mystock.find({owner: req.user._id})
            let totalInv = 0
            let avgPrice = 0
            let totalStocks = 0
            let totalReturn = 0
            for(var i=0;i<mystocks.length;i++){

                totalStocks = totalStocks + mystocks[i].quantity
                totalReturn = totalReturn + mystocks[i].totalReturns
            }

            req.user.invested = req.user.invested - quantity*mystock.buyPrice
            req.user.balance = req.user.balance + quantity*price
            req.user.buyPrice = req.user.invested/totalStocks
            req.user.roi.totalReturns = totalReturn
            req.user.roi.percentage = req.user.roi.totalReturns/req.user.invested
            await req.user.save()

            return res.send({
                mystock,
                user: req.user,
                history
            })
        }
        else {

            mystock.totalInvestment = mystock.totalInvestment - quantity*(mystock.buyPrice)
            console.log('mystock total inv now--------', mystock.totalInvestment);
            // mystock.buyPrice = mystock.totalInvestment/mystock.quantity
            mystock.totalReturns = (stock.prices[doy+1]*mystock.quantity) - mystock.totalInvestment
            await mystock.save()
            console.log('mystock saved------');

            let mystocks = await Mystock.find({owner: req.user._id})
            let totalInv = 0
            let avgPrice = 0
            let totalStocks = 0
            let totalReturn = 0
            for(var i=0;i<mystocks.length;i++){

                totalStocks = totalStocks + mystocks[i].quantity
                totalReturn = totalReturn + mystocks[i].totalReturns
            }

            req.user.invested = req.user.invested - quantity*mystock.buyPrice
            req.user.balance = req.user.balance + quantity*price
            req.user.buyPrice = req.user.invested/totalStocks
            req.user.roi.totalReturns = totalReturn
            req.user.roi.percentage = req.user.roi.totalReturns/req.user.invested
            await req.user.save()
            console.log('user saved-------');

            let history = new History({
                name,
                stockType: stock.stockType,
                stockId: stock.stockId,
                trade,
                owner: req.user._id,
                quantity,
                pricePerUnit: price,
                totalAmount: quantity*price,
                date: date1
            })
            await history.save()

            return res.send({
                mystock,
                user: req.user,
                history
            })
        }

        
    }

})

router.post('/mystocks', async(req,res)=>{
    
    let mystocks = await Mystock.find({})

    try {
        res.send(mystocks)
    } catch (e) {
        res.send(e)
    }
})

router.post('/history', async(req,res)=>{
    
    let history = await History.find({})

    try {
        res.send(history)
    } catch (e) {
        res.send(e)
    }
})

router.post('/bondtransaction', auth, async(req,res)=>{

    let name = req.body.name
    let coupon = 0.5
    let price = req.body.price
    let trade = req.body.trade
    let date = req.body.date
    date = date.split('/')
    let months={'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'}
    console.log('name quant buypr---->', name, trade, date);
    console.log(`${date[0]} ${months[date[1]]} ${date[2]}`);
    let date1 = new Date(`${date[0] } ${months[date[1]]} ${date[2]}`)
    console.log('date1----------->',date1);
    let date0 = new Date("1 January 2019")
    let date01 = new Date("31 July 2019")
    console.log('date0----------->', date0);
    // let doy = (date1 - date0)/(1000*60*60*24) + 1 
    let doy

    if(date1<date01){
        doy = (date1 - date0)/(1000*60*60*24)
    }else{
        doy = (date1 - date01)/(1000*60*60*24)
    }

    console.log('DOY----------->', doy);
    // let stock = await Stock.findOne({name})

    try {

        if(trade==='buy'){
            
            let accInt = price*0.5*doy/(36500)
            let totalPrice = price + accInt

            req.user.balance = req.user.balance - totalPrice
            req.user.bond.invested = totalPrice
            await req.user.save()
            console.log('user saved----------');
            let bond = new Bond({
                name,
                buyPrice: price,
                buyPriceDirty: totalPrice,
                owner: req.user._id
            })
            await bond.save()
            let bondTemp = await Bond.findOne({name:bond.name, owner: req.user._id})
            console.log('bond saved--------------');
            let bondHistory = new BondHistory({
                name,
                stockId: bondTemp.stockId,
                owner: bond.owner,
                trade,
                price,
                priceDirty: totalPrice
            })
            await bondHistory.save()
            console.log('bondhistory saved----------------');

            // let bondReturnHistory = new BondReturnHistory({
            //     name,
            //     stockId: bond.stockId,
            //     owner: bond.owner,

            // })

            return res.send({
                bond,
                user,
                bondHistory
            })

        }else{

            let bond = await Bond.findOne({name, owner: req.user._id})

            let accInt = bond.buyPrice*0.5*doy/(36500)
            let totalPrice = bond.buyPrice + accInt

            await bond.save()
            console.log('bond saved---------------');
            req.user.balance = req.user.balance + totalPrice
            req.user.bond.invested = req.user.bond.invested - bond.buyPriceDirty
            await req.user.save()
            console.log('user saved------------------------');

            let bondHistory = new BondHistory({
                name,
                stockId: bond.stockId,
                owner: bond.owner,
                trade,
                price,
                priceDirty
            })
            await bondHistory.save()
            console.log('bondhistory saved---------------');

            // let bondReturnHistory = new BondReturnHistory({
            //     name,
            //     stockId: bond.stockId,
            //     owner: bond.owner,
            //     totalReturns: 
            // })
            // await bondReturnHistory.save()
            let del = await Bond.findOneAndDelete({name,owner: bond.owner})

            return res.send({
                bond,
                user,
                bondHistory
            })
        }

    } catch (e) {
        res.send(e)
    }
})

router.patch('/updatestockprices', async(req,res)=>{


    let date = req.body.date
    date = date.split('/')
    let months={'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'}
    console.log('name quant buypr---->', name, quantity, trade, date);
    console.log(`${date[0]} ${months[date[1]]} ${date[2]}`);
    let date1 = new Date(`${date[0] } ${months[date[1]]} ${date[2]}`)
    console.log('date1----------->',date1);
    let date0 = new Date("1 January 2019")
    console.log('date0----------->', date0);
    let doy = (date1 - date0)/(1000*60*60*24)
    console.log('DOY----------->', doy);

    try {
        
        let totalReturns = 0

        let mystocks = await mystocks.find({})

        for(var i=0;i<mystocks.length;i++){
            let stock = await Stock.findOne({name:mystocks[i].name})
            mystocks[i].totalReturns = mystocks[i].quantity*stock.prices[doy+1]
            totalReturns = totalReturns + mystocks[i].totalReturns
            await mystocks[i].save()

        }

        req.user.roi.totalReturns = totalReturns
        req.user.roi.percentage = totalReturns*100/req.user.invested
        await req.user.save()

        res.send({
            user: req.user,
            mystocks
        })

        
    } catch (e) {
        res.send(e)
    }  
})

router.patch('/updatebondprices', async(req,res)=>{

    let date = req.body.date
    date = date.split('/')
    let months={'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'}
    console.log('name quant buypr---->', name, quantity, trade, date);
    console.log(`${date[0]} ${months[date[1]]} ${date[2]}`);
    let date1 = new Date(`${date[0] } ${months[date[1]]} ${date[2]}`)
    console.log('date1----------->',date1);
    let date0 = new Date("1 January 2019")
    console.log('date0----------->', date0);
    let date01 = new Date("1 July 2019")
    let doy = (date1 - date0)/(1000*60*60*24)
    console.log('DOY----------->', doy);

    let bonds = await Bond.find({})

    try {
        let totalReturns = 0

        for(var i=0;i<bonds.length;i++){

            if(date1>date01){
                bonds[i].totalReturns = 1
                totalReturns = totalReturns + bonds[i].save()
                await bonds[i].save()
            }
        }

        req.user.bond.totalReturns = req.user.bond.totalReturns + totalReturns
        await req.user.save()

        res.send({
            user: req.user,
            bonds
        })
    } catch (e) {
        res.send(e)
    }

})

router.post('/createpdf', async(req,res)=>{

    // try {
        
    //     const browser = await puppeteer.launch()
    //     const page = await browser.page()

    //     await page.setContent('<h1>Hello</h1>')
    //     await page.emulateMedia('screen')
    //     await page.pdf({
    //         path: 'output.pdf',
    //         format: 'A4',
    //         printBackground: true
    //     })

    //     console.log('done')
    //     await browser.close()
    //     // process.exit()
    //     res.send({
    //         msg: 'Done'
    //     })
        

    // } catch (e) {
    //     res.send(e)
    // }


    try {
        const html = await fs.readFileSync('D:/ReactJS/NodeJs/portfolio-reporting-app/src/routers/portfolio/template.html', 'utf-8')
        // console.log('html--------------------', html);
        const stockHistory = await History.find({}).lean()

        var options = { format: "A3", orientation: "portrait", border: "10mm" }

        const document = {
            html,
            data: {
                stockHistory
            },
            path: "D:/ReactJS/NodeJs/portfolio-reporting-app/src/routers/portfolio/output.pdf"
        }
        console.log(document);
        const responsepdf = await pdf.create(document, options)
        console.log('response---------',responsepdf);

        res.send({
            html,
            responsepdf
        })
    } catch (e) {
        res.send(e)
    }

})


module.exports = router
