import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            throw new ApiError(401,"unauthorized req")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            //discuss about frotnend
            throw new ApiError(401,"invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }
})
