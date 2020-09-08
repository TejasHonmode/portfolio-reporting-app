const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/portfolio-reporting-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

