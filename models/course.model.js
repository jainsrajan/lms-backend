import { Schema , model } from 'mongoose'

const courseSchema = new Schema({
    title:{
        type:String,
        required:[true , 'Title is required'],
        minLength:[8 , 'Title must be atleast 8 character'],
        maxLength:[60 , 'Title should be less then 60 character'],
        trim:true,
    },
 
    description:{
        type:String,
        required:[true , 'Description is required'],
        minLength:[8 , 'Description must be atleast 8 character'],
        maxLength:[200, 'Description should be less then 60 character'],
    },

    category:{
        type:String,
        required:[true,'Category is required']
    },

thumbnail:{
    public_id:{
        type:String,
        required:true,
    },

    secure_url:{
type:String,
required:true,
    }
},


    lectures: [
    {
title:String,
description:String,


lecture:{
    public_id:{
type:String,
required:true,

    },

    secure_url:{
        type:String,
        required:true
    }
  }
}
],

numbersOfLectures:{
    type:Number,
    default:0,

},
createdBy:{
    type:String,
   
}
},
{
    timestamps:true

});

const Course = model('Course' , courseSchema)
export default Course