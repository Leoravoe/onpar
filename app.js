const express = require('express')
const cors = require('cors')

require('./db/conn')
require("dotenv").config();

// app config
const app = express()
const PORT = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// register view engine
app.set("view engine", "ejs");

app.listen(PORT,()=>{
    console.log('connected to port 5000')
})

// routes
app.use(require('./routes/routes'))