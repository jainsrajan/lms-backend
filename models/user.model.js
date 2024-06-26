import {Schema , model} from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
// import { type } from 'os';

const userSchema = new Schema({

    fullName:{
        type:'String',
        required:[true , 'Name is required'],
        maxLength:[50 , 'Name must be less then 50 character'],
        lowercase:true,
        trim:true
    },

    email:{
        type:'String',
        required:[true, 'Email is required'],
        lowercase:true,
        trim:true,
        unique:true,
        // match:'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$'

    },

    password:{
        type:'String',
        required:[true , 'Password is required'],
        minLength:[8 , 'Password must be atleast 8 characters'],
        select:false

    },

    avatar:{
        
        public_id:{
            type:'String'
        },

        secure_url:{
            type:'String'
        }
    },

    country:{
        type:'String', 
        required:true

    },

    role:{
        type:'String',
        enum:['USER' , 'ADMIN'],
        default:'USER'
    },

    forgotPasswordToken:String,
    forgotPasswordExpiry: Date,

    subscription:{
    
        id:String,
        status: String
    },

},

{
    timestamps:true
});

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        return next()
    }

    this.password = await bcrypt.hash(this.password , 10)
})

userSchema.methods = {
    generateJWTToken: async function()
    {
          return await jwt.sign(

{ id:this._id, email: this.email, subscription:this.subscription , role:this.role},

process.env.JWT_SECRET,

{
    expiresIn: process.env.JWT_EXPIRY,
    }

          )
    },


    comparePassword: async function(plainTextPassword)
    {
        console.log("Passwords are as follows " ,plainTextPassword)
        console.log("The bcrypted password is", this.password)
        return await bcrypt.compare(plainTextPassword , this.password)

    },

    generatePassword: async  function(){
        const resetToken =  crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        ;
        this.forgotPasswordExpiry = Date.now()+15*60*1000

        return resetToken;
    },
}

const User = model('User' , userSchema )
export default User