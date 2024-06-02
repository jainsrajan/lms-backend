import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'

const cookieOptions={
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    sameSite: 'None',
    secure:true
    }



const register = async(req, res , next)=>{

    const {fullName , email , password,country } = req.body;

    if(!fullName || !email || !password || !country)
    {
        return next(new AppError('All fields are required' , 400))
    }

    if(!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm))
        {
            return next(new AppError('Re-Enter your password' , 400))
        }
    

    const userExists =  await User.findOne({email});

    if(userExists)
    {
        return next(new AppError('User Allready exists' , 400))
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar:{
            public_id:" ",
            secure_url:" "
        },
        country
    
    })

if(!user)
{
    return next(new AppError('User registration failed , please try again' , 400));
}


console.log("File Details- " , JSON.stringify(req.file))

if(req.file)
{
   
    try {

        const result = await cloudinary.v2.uploader.upload(req.file.path , {
            folder:"lms",
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        })
        
if(result)
{
    user.avatar.public_id = result.public_id
    user.avatar.secure_url = result.secure_url

    // Remove file from the server

    fs.rm(`uploads/${req.file.filename}`)
}




    } catch (e) {
        return next(
            new AppError(e || 'File not uploaded, please try again' , 500)
        )
    }
}

await user.save()

user.password = undefined;

const token = await user.generateJWTToken()

res.cookie('token' , token , cookieOptions)

const {toke} = req.cookies
console.log(toke)

res.status(201).json({
    success:true,
    message:'User registered successfully',
    user,
})
}
   
const login = async (req , res , next)=>{

    try {

        const {email , password} = req.body

        if(!email || !password)
        {
            return next(new AppError('All fields are required' , 400))
        }
    
        const user = await User.findOne({
            email
        })
        .select('+password');

    console.log("The user is",user)
    console.log("The login compare password is" ,await user.comparePassword(password))
        if(!user || !await user.comparePassword(password))
        {
            return next(new AppError('Email or password does not match' , 400))
        }
    
        const token = await user.generateJWTToken()
        user.password=undefined
    
        res.cookie('token' , token , cookieOptions);
    
        res.status(200).json({
            success:true,
            message:'User loggedin successfully',
            user,
        })
        
    } catch (error) {
        
        return next(new AppError(error.message , 500));
        
    }
}

const logout=(req,res)=>{

    try {

        res.cookie('token' , null,{
        
            secure:true,
            maxAge:0,
            httpOnly:true
        });
    
    
        res.status(200).json({
            success:true,
            message:'User logged out successfully'
        })
        
    } catch (error) {
        return next(new AppError(error.message))
    }
   
}

const getProfile=  async (req,res , next)=>{


    try {
      
    const userId = req.user.id;
    console.log("user" ,req.user) 
    const user = await User.findById(userId)

    res.status(200).json({
        success:true,
        message:'User Details',
        user,
    })
    
    }
     catch (error) {
        return next(new AppError(error.message , 500))
    }
}

const forgotPassword = async (req , res  , next)=>{
    const {email} = req.body
    
    if(!email)
    {
        return next(new AppError('Email not registered' , 400));
    }
    const user = await User.findOne({
        email
    })

if(!user)
{
return next(new AppError('Email not registered' , 400))

}

const resetToken = await user.generatePassword();

await user.save()


//This URL has to be sent to the email of the user

const resetPasswordUrl = `https://bucolic-mooncake-057a17.netlify.app/reset-password/${resetToken}`
console.log(resetPasswordUrl)

const message = `${resetPasswordUrl}`
const subject = 'reset password'

try {
    await sendEmail(email,subject,message)
    
    res.status(200).json({
        success:true,
        message:`Reset password token had been sent to the email-${email} successfully`
    })
} catch (error) {

    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    await user.save()
    
    return next(new AppError(error.message , 500))
}}


const resetPassword = async (req , res , next)=>{

    try {
        
        const{resetToken} = req.params;

        // console.log("The RESET-TOKEN  is ",resetToken)
        
        const {password} = req.body
        
        // console.log("The password is"  , password)
        
        const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        
        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry:{$gt: Date.now()}
        })
        if(!user)
        
        {
            return next(new AppError('Token is invalid of expire, Please try again' , 400))
        }
        
        user.password =  password
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save()
        
        res.status(200).json({
        success:true,
        message:'Your passsword changes successfully'
        })
        

    } catch (error) {
        return next(new AppError(error?.message , 500))
    }

}


const changepassword = async(req , res ,  next)=>{

    const{oldpassword , newpassword} = req.body
    const{id} = req.user

    if(!oldpassword || !newpassword)
    {
        return next(new AppError('All fields are mandatory' , 500))
    }

    const user = await User.findById(id).select('+password')

    if(!user)
    {
        return next(new AppError("User dosen't exist" , 500))
    }

    const isPasswordValid = await user.comparePassword(oldpassword)
    console.log("Is password valid",isPasswordValid)

    if(!isPasswordValid)
    {
        return next(new AppError('Invalid old password' , 500))
    } 

    user.password = newpassword
    await user.save()

    user.password = undefined

    res.status(200).json({
        success:true,
        message:'Password change successfully'
    })
}


const updateuser =  async(req , res , next)=>{

const{fullName} = req.body
const userId = req.user.id
console.log("id is given as.... ",userId)

const user = await User.findById(userId);

if(!user)
{
    return next(new AppError('User does not exist' , 500))
}


// if(req.fullName)
// {
//     user.fullName = fullName
// }

user.fullName = fullName

console.log("user fullname is " , user.fullName)


if(req.file)
{
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
}

if(req.file)
{
   
    try {

        const result = await cloudinary.v2.uploader.upload(req.file.path , {
            folder:"lms",
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        })
        
if(result)
{
    user.avatar.public_id = result.public_id
    user.avatar.secure_url = result.secure_url

    // Remove file from the server

    fs.rm(`uploads/${req.file.filename}`)
}

    } catch (e) {
        return next(
            new AppError(e || 'File not uploaded, please try again' , 500)
        )
    }
}

await user.save()

res.status(200).json({
    success:true,
    message:'User details updated successfully',
    user
})
}


export{
     register,
     login,
     logout,
     getProfile,
     forgotPassword,
     resetPassword,
     changepassword,
     updateuser,
}
