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
    email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Regular expression for validating email format
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`,
    },
  },
    fullname: {
         type: String,
            required: true,
            trim: true, 
            index: true
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
    this.password =await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}
//isko 2 params dere ek hmra pass ek encrypt pass dono ko compare kr rha h ye
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


