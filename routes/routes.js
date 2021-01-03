const { Router } = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const aController = require('../controllers/controller')
const Employee = require('../model/employee')
const grid = require('../db/conn')

const router = Router()

const storage = new GridFsStorage({
    url: process.env.DB_URI ,
    file: (req, file) => {
        try {
          return new Promise(async (resolve, reject) => {
            const filename = file.originalname;
            const filenam = filename.split('.').slice(0, -1).join('.')
            const result = await Employee.findOne({employeeID : filenam})
            if (result){
              await Employee.findOneAndUpdate({employeeID : filenam},{$push : {document: filename}})
              const fileInfo = {
                  filename: filename,
                  bucketName: 'pdfs'
                };
                resolve(fileInfo);
            }else{
              reject("employee not found")
            }
          })
        } catch (error) {
          console.log(error)
        }
    }
  });
  const upload = multer({ storage });


router.get('/',aController.fetch)
router.post('/uploads',upload.array('file', 12),aController.upload)
router.get('/:id',aController.employee)
router.get('/doc/:filename',aController.file)
router.delete('/:id',aController.erase)

module.exports = router