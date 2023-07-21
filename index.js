const express = require('express')
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    const data = process.env.CYCLIC_DB;
    res.send('WUZZUPPPPP!' + data)
})
app.listen(process.env.PORT || 3000)