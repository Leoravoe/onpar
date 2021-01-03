const mongoose = require('mongoose')
const Employee = require('../model/employee')
const Grid = require('gridfs-stream')
const conn = require('../db/conn')

// initializing grid storage engine gfs
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db,mongoose.mongo)
    gfs.collection('pdfs')
})

module.exports.fetch = async(req,res) => {
    const result = await Employee.find()
    res.render('index',{result})
}
module.exports.upload = async(req,res) => {
    let document = []
    const {employeeID} = req.body
    req.files.forEach(ele => {
        document.push(ele.filename)
    })
    const doc = new Employee({
        employeeID,
        document
    })
    try {
        if(employeeID){
            await doc.save()
            res.redirect('/')
        }else{
            res.status(200).redirect('/')
        }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports.employee = async(req,res) => {
    const result = await Employee.find({employeeID : req.params.id})
    res.render('details',{item : result[0]})
}
module.exports.file = async (req,res)=>{
    await gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No files found'
            })
        }
        const readStream = gfs.createReadStream(file.filename)
        readStream.pipe(res)
    })
}
module.exports.erase = async (req, res) => {
    const id = req.params.id +".jpg"
    console.log(id)
    try {
        await Employee.findOneAndDelete({ employeeID : req.params.id },async(err,employee) => {
            if (err) {
                res.status(500).json({message:err})
            }
            await gfs.files.remove({filename: id},(err,files) => {
                if (err) res.status(404).json({message:err})
                res.status(200)
            })
        })
        res.json({ redirect : '/'})
    } catch (error) {
        console.log(error.message)
    }
}