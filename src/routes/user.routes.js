import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
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
//add login route
router.route("/login").post(loginUser)

//secured routes pehle check krlo ki user login h already fir hi logout kr payenge ham isiliye middleware h verifyJWT
//isiliye next() likjhte h verifyJWT ka kaam khtm hgya h ab logoutUser p jump krjo
router.route("/logout").post(verifyJWT, logoutUser)
router.route("refresh-token").post(refreshAccessToken)
export default router
