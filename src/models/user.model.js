import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,//if searching jyada krni h to index true krdo taaki db k searching m aane lg jaye
        
    },
    emai: {
         type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
         type: String,
        required: true,
        
        
        trim: true,
    },
    avatar: {
        type: String,//cloudnaty url
        required: true,
        
    },
    coverImage: {
         type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password: {
        type: String,
        required: [true,'Password is required'],
        
    },
    refreshToken: {
        type:String,
    },
}, { timestamps: true })
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
       
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname:this.fullname,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)


