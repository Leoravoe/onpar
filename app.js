const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const multer = require('multer')
const Grid = require('gridfs-stream')
const GridFsStorage = require('multer-gridfs-storage')
const crypto = require('crypto')
const Employee = require('./model/employee')

// app config
const app = express()
const PORT = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// register view engine
app.set("view engine", "ejs");


// db connection
const db_URI = 'mongodb+srv://admin:admin@onpar.yfqrm.mongodb.net/OnparLab?retryWrites=true&w=majority'
mongoose.connect(db_URI,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true})
.then(() =>{
    console.log("connected to database ")
})

const conn = mongoose.createConnection(db_URI,{useNewUrlParser: true, useUnifiedTopology:true},()=> console.log("connected to upload pdf"))

app.listen(PORT,()=>{
    console.log('connected to port 5000')
})


// initializing grid storage engine gfs

let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db,mongoose.mongo)
    gfs.collection('pdfs')
})

const storage = new GridFsStorage({
    url: 'mongodb+srv://admin:admin@onpar.yfqrm.mongodb.net/OnparLab?retryWrites=true&w=majority',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
        //   const filename = buf.toString('hex') + path.extname(file.originalname);
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'pdfs'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

// routes

app.get('/',async(req,res) => {
    const result = await Employee.find()
    console.log(result)
    // res.send('hello')
    res.render('index',{result})
})
app.post('/uploads',upload.array('file', 4),async(req,res) => {
    let document = []
    const {employeeID} = req.body
    req.files.forEach(ele => {
        document.push(ele)
    })
    const doc = new Employee({
        employeeID,
        document
    })
    try {
        const emp = await doc.save()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
})

app.get('/:id',async(req,res) => {
    const result = await Employee.find({employeeID : req.params.id})
    // res.send('hello')
    // console.log(result)
    // console.log(result.employeeID)
    // console.log(result._id)
    res.render('details',{item : result[0]})
})

app.get('/doc/:filename', async (req,res)=>{
    // console.log(req.params.filename)
    // res.send(req.params.filename)
    await gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No files found'
            })
        }
        // res.json(file)
        const readStream = gfs.createReadStream(file.filename)
        readStream.pipe(res)
    })
})

app.delete('/:id', async (req, res) => {
    // console.log(req.params.id)
    try {
        await Employee.findOneAndDelete({ employeeID : req.params.id },async(err,employee) => {
            if (err) {
                res.status(500).json({message:err})
            }
            await gfs.files.remove({filename: req.params.id},(err,files) => {
                if (err) res.status(404).json({message:err})
                res.status(200)
            })
        })
        res.json({ redirect : '/'})
    } catch (error) {
        console.log(error.message)
    }
})