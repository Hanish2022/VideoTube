import multer from 'multer'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {//file access sirf multer pe hota h,,,cb means callbacxk
    cb(null, "./public/temp")//public folder
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname )
  }
})

export const upload = multer({
     storage,
})

//How multer Handles next()?
// When you create an upload middleware with multer, it internally handles the file processing and then automatically calls next() after the file has been processed and stored according to the configuration you provided.