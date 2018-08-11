const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(morgan('combined'))


app.get('/', function (req, res) {

    const date = new Date()

    if (date.getMinutes() % 3 == 0) {
        res.status(500).send('<html><body><h1>Error !</h1></body></html>')
    } else {
        res.status(200).send('<html><body><h1>Ok</h1></body></html>')
    }
})

app.listen(1844, '0.0.0.0')
