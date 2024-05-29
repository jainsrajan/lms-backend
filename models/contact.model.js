import { Schema , model } from "mongoose";

const contactSchema = new Schema({

    name:{
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
            unique:true
        
    },

    message:{
type:'String',
required:[true , 'Message is required'],
    }

},

{
    timestamps:true
}) 

const contactUs = model("contactUs" , contactSchema );
export default contactUs