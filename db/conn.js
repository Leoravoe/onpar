const mongoose = require('mongoose')
require("dotenv").config();


// db connection
const db_URI = process.env.DB_URI
mongoose.connect(db_URI,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true})
.then(() =>{
    console.log("connected to database ")
})

module.exports = mongoose.createConnection(db_URI,{useNewUrlParser: true, useUnifiedTopology:true},()=> console.log("connected to upload pdf"))
