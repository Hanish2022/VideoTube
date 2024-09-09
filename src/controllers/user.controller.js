import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
//user vs User
/*
user ek hmara sainik h jo hmare bnaye methods se baat chit krega
User ek mongodb mongoose ka sainik h jo unke bnaye methdos se baat chir karega
*/
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message:"ok"
    // })

    //steps for registering user
    
    //get user details from frontend
    //validation -not empty
    //check if user already exists: username ,email
    //check for img,check for avatar
    //uplaod them to cloudnary, avatar
    //create user object- create entry in db
    //remove pass and refresh token from response
    //check for user creation
    //return response


    //detail lerrhe
    const { fullname, email, username, password } = req.body
    console.log("fullname", fullname);
    // console.log(1);


    //validating kr rhe
    if (
        [
            fullname,email,username,password
        ].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"all fields are req")
    }
    // console.log(2);

    //checking if existed already ir not
    const existedUser = await User.findOne({
     //if email or username dono me se koi exist kre to error
        $or: [{ username }, { email }]
        
 })
    if (existedUser) {
        throw new ApiError(409,"User with this email is already exists")
    }

    // console.log(3);
//check for img and avaatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    //classic way of doing th same thing
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar img is req")
    }

    //upload at cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
         throw new ApiError(400,"avatar img is req")
    }
    // console.log(4);
    //create enrry in db
   const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",//cehck if empty nhi h to .url vrna ""
        email:email,
        password,
       username: username.toLowerCase()
   })
    console.log("registered");
    //check if creadted successfully or not and remove password field etc
    const createdUser = await User.findById(user._id).select(//user._id se find kr rhe if user created or not
        //.selct() me vo vo faldo jo remove krna chahte ho jaise pass and refrssh tokens
        "-password -refreshToken"
    )
    
    if (!createdUser) {
        throw new ApiError(500,"smth went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
        
    )
})
const generateAccessNrefreshToken = async (userId)=>{

    try {
        const user = await User.findById(userId)//finding the user
       const accessToken= user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken//saving refresh token in DB
        await user.save({ validateBeforeSave: false })//validation not needed kyuki req vgera wale sb aa jayenge errors vgera 
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"soething wen twronf while generatinf tokens")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //req body se data leke ana
    //username or email
    //find user in body
    //pass check
    //access and refresh token dedo user ko
    //send tokens in cookies

    //takin data  from body
    const { email, username, password } = req.body
    //checking username and email
    if (!username && !email) {
        throw new ApiError(400,"username or email is req")
    }

    //find user in bdy
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404,"user does not exist")
    }

    //pass check
  const isPasswordValid=  await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401,"password does not matched")
    }

    //tokens generate
    const { accessToken, refreshToken } = await generateAccessNrefreshToken(user._id)
    
    //cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // sending cookies
    const options = {
        //cookies ko by defauklt koi v modify kr skta front edn me pr http only and secure ko true krke sirf backend se hi server hi kr payega updatye
        httpOnly: true,
        secure:true
    }
    return res
        .status(200)
        //sending cookie in response
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            //send response acc to ApiResponse constructor
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken//ques-> agr cookies me tokens bhej diye to yaha kyu bhejna h firse? -> kyuki user agr local storage me save krna chahta ho cookies ko alg se to kr skta aise
                },
                "user logged in successfuly"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    //find user
   await User.findByIdAndUpdate(//user ki id nhi h logout time isilye middleware lgaya h auth wala
        req.user._id,//ab access milgya user ka middleware se
        {
            $set: {
                refreshToken:undefined//update kr rhe h rfrsh token ko taki logout hoje
            }
        }, {
            new:true//return me new uodated value aayegs
        }
    )
    //again cookies wala kam
    const options = {
        httpOnly: true,
        secure:true
    }
    return res
        .status(200)
        //clearing cookies
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"user logged out"))

})
    
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken//refresh token cookies se access hoga || koi mobl=ile app use kr rha h to body se access hoga
    //we will compare this incomingtoken with our db token later
    if (!incomingRefreshToken) {
        throw new ApiError(401,"unauthorized req at token")
    }
    //now verify the incomingtoken with JWT
   try {
    const decodedToken= jwt.verify(
         incomingRefreshToken,//token
         process.env.REFRESH_TOKEN_SECRET//secret
       )
       //now we have convrrtied incoming token into decoded token
     const user = User.findById(decodedToken?._id)//refrshtoken me id di thi hmne models me us se refreshtoken find kro db me
      if (!user) {
         throw new ApiError(401,"invalid refreshtoken")
       }
       //ccompare the incoming one and refreshtoken of user in db
     if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401,"refreshtoken is expired or used")
     }
 //cookies me bhejdo ab verified h tokens
     const options = {
         httpOnly: true,
         secure:true
       }
       //naye tokens generate krwado ab
       const { accessToken, newrefreshToken } = await generateAccessNrefreshToken(user._id)
       //now send respionse 
     return res
         .status(200)
         .cookie("accessToken", accessToken,options)
         .cookie("refreshToken", newrefreshToken, options)
         .json(
             new ApiResponse(
                 200,
                 { accessToken, newrefreshToken },
                 "Access token refreshed"
         )
     )
   } catch (error) {
       throw new ApiError(401, error?.message || "invalid refrehs token")
       
   }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)//purane user ko lelo
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)//check old password
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old pass")
    }
    user.password = newPassword//now change password with new one
    await user.save({ validateBeforeSave: false })//save changes
    return res
        .status(200)
    .json(new ApiResponse(200,{},"pass changeed successfully"))
    
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched successfully")//middlware me req.user run hogya
    
})
//update text
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fields req")
        
    }
  const user=  User.findByIdAndUpdate(
        req.user?._id,//user find krne ka trika
        {
            $set: {
                fullname,//1st way
                email:email//2nd way
            }
        },
        { new: true }//update k naad jo info h vo return hui
    ).select("-password")//i dont want to change my password
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//update files by multe
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path//file lelo req me se
    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is issing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)//upload on cloudnary
    if (!avatar.url) {
        throw new ApiError(400,"error while uplaoding on avatar")
    }
    //update avatar
   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar:avatar.url
            }
        },
        { new: true }
        
    ).select("-password")

     return res
        .status(200)
        .json(
        new ApiResponse(200,user,"avatar updated successfuklly")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const CoverImageLocalPath = req.file?.path//file lelo req me se
    if (!CoverImageLocalPath) {
        throw new ApiError(400,"cover img file is issing")
    }
    const coverImage = await uploadOnCloudinary(CoverImageLocalPath)//upload on cloudnary from models...coverImage name shjould be same as models wala
    if (!coverImage.url) {
        throw new ApiError(400,"error while uplaoding on coverimg")
    }
    //update imagecover
 const user=   await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage:coverImage.url
            }
        },
        { new: true }
        
    ).select("-password")

    //return res
    return res
        .status(200)
        .json(
        new ApiResponse(200,user,"coverimg updated successfuklly")
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}