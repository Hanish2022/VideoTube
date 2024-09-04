import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
//this middleware just verify if user h ya nhi
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            throw new ApiError(401,"unauthorized req")
        }
    //decode the token for checking info
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //db req maro
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            //discuss about frotnend
            throw new ApiError(401,"invalid access token")
        }
    //req me user add krdiya h
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }
})
