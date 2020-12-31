const mongoose = require('mongoose')


const uploadPdf = new mongoose.Schema({
    employeeID : { type: String},
    document: []
})

module.exports = mongoose.model('employee',uploadPdf)