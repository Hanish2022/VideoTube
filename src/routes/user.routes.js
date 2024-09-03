import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/register").post(
    //how to handle files
    upload.fields([
        {
            name: "avatar",//first file
            maxCount:1
        },
        {
            name: "coverImage",//second file
            maxCount:1
       } 
    ]),
    //registeruser method se pehle hmne yaha pe middleware inject krdiya ek jo files hANDling k kaam aaraha h upload.fields krke this is the WAY of handling middlewares
    registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT ,logoutUser)
export default router
