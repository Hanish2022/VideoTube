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