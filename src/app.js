const express = require('express')
require('./db/mongoose')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')

const userRouter = require('./routers/user/user')
const portfolioRouter = require('./routers/portfolio/portfolio')
const sampleRouter = require('./routers/sample')

const app = express()
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')

app.set('view engine','hbs')
app.set('views', viewsPath)

app.use(express.json())
app.use(express.static(publicDirectoryPath))
app.use(express.static(publicDirectoryPath))
app.use(userRouter)
app.use(portfolioRouter)
app.use(sampleRouter)

app.listen(port, () => {
    console.log('Server is up on port 3000')
})