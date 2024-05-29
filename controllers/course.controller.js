import { appendFile } from "fs";
import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import asyncHandler from 'express-async-handler'
import { response } from "express";

const getAllcourses  =  async function(req , res ){
 const courses = await Course.find({}).select('-lectures');


try {
    res.status(200).json({
        success:true,
        messsage:'All courses',
        courses,
     })

    
} catch (error) {
     return next(new AppError(error.messsage , 500))
}}


const getLecturesByCourseId  =  async function(req , res , next){

try {
    const {id} = req.params

    const course = await Course.findById(id)

    if(!course)
    {
        return next (new AppError("Invalis course id" , 400))
    }

    res.status(200).json({
        success:true,
        message:'Course Lectures fetched successfully',
        lectures:course.lectures
    })
    
} catch (e) {
    return next(new AppError(e.messsage , 500))
    
}}


const createCourse = async (req,res,next)=>{

    try {
        
        const{title , description , category , createdBy} = req.body

        console.log(req.body)

        if(!title || !description || !category || !createdBy)
        {
            return next(new AppError("All fields are required" , 400))
        }
        
        const course = await Course.create({
        
            title,
            description,
            category,
            createdBy,
            thumbnail:{
                public_id:"Dummy ",
                secure_url:"Dummy "
            }
        });

        
        if(!course)
        {
            return next(new AppError("Course could not be created , please try again" , 500))
        }
        
        if(req.file)
        {
            const result = await cloudinary.v2.uploader.upload(req.file.path , { 
        
                    folder: 'lms'
            })
        
            if(result)
            {
                 course.thumbnail.public_id = result.public_id
                 course.thumbnail.secure_url = result.secure_url
            }
        
            fs.rm(`uploads/${req.file.filename}`)
        }
        
        await course.save()
        
        res.status(200).json({
            success:true,
            message: 'Course created successfully',
            course
        })
    
    } catch (error) {
        
return  next(new AppError(error.message , 500))
    }

}

const updateCourse = async function(req ,res , next)
{

    try {

 const {id}= req.params

 const course = await Course.findByIdAndUpdate(
    
       id,
       {
         $set:req.body
       },

       {
         runValidators:true
       }

)

if(!course)
{
return next (new AppError('Course with given id does not exist' , 500))
}

res.status(200).json({
    success:true,
    message:'Course updated successfully'
})

    } catch (error) {
        return next (new AppError(error.message , 500))
    }
}


const removeLecturesfromCourse = async (req , res , next)=>{
    const {courseId , lectureId} = req.params

    console.log("The course and lecture ids are" , req.params);

    if(!courseId)
    {
        return next(new AppError('course id is required' , 400))
    }


    if(!lectureId)
    {
        return next(new AppError('lecture id is required' , 400))
    }

    const course = await Course.findById(courseId);

    if(!course)
    {
        return next(new AppError('Invalid id or course does not exist' , 400))
    }

    const lectureIndex = course.lectures.findIndex(
        (lecture) => lecture._id.toString() === lectureId.toString()
      );
    
      // If returned index is -1 then send error as mentioned below
      if (lectureIndex === -1) {
        return next(new AppError('Lecture does not exist.', 404));
      }
    
      // Delete the lecture from cloudinary
      await cloudinary.v2.uploader.destroy(
        course.lectures[lectureIndex].lecture.public_id,
        {
          resource_type: 'video',
        }
      );
    
      // Remove the lecture from the array
      course.lectures.splice(lectureIndex, 1);
    
      // update the number of lectures based on lectres array length
      course.numbersOfLectures = course.lectures.length;
    
      // Save the course object
      await course.save();
    
      // Return response
      res.status(200).json({
        success: true,
        message: 'Course lecture removed successfully',
      });
}

const removeCourse = async function (req , res , next)
{

    try {
        const {id} = req.params
        const course = await Course.findById(id)
        
if(!course)
{
    return next(new AppError('Course with given id does not exist' , 500))
}

    await Course.findByIdAndDelete(id)
        
res.status(200).json({
    success:true,
    message:'Course deleted Successfully'
})
     
    } catch (error) {
        return next(new AppError(error.message , 500))
    }
}


const addLectureToCourseById = async function(req , res , next)

{

    try {

        const{title , description} = req.body
        const{id} =  req.params
    
        const course = await Course.findById(id);
    
        if(!course)
        {
            return next(new('Course with given id does not exist' , 500))
        }
    
    const lectureData = {
        title,
        description,
        lecture: {}
    };
    
    console.log(lectureData)
    
    if(req.file)
    {
        const result = await cloudinary.v2.uploader.upload(req.file.path , { 
    
                folder: 'lms',
                chunk_size : 50000000,
                resource_type: 'video'
            
            })
    
        if(result)
        {
             lectureData.lecture.public_id = result.public_id
             lectureData.lecture.secure_url = result.secure_url
        }
    
        fs.rm(`uploads/${req.file.filename}`)
    }
    
    course.lectures.push(lectureData)
    
    course.numbersOfLectures = course.lectures.length;
    
    await course.save()
    
    res.status(200).json({
        success:true,
        message: 'Lectures added successfully',
        course
    })
        
        
    } catch (e) {
        return next(new AppError(e.message , 400))
        
    }

}


export{
    getAllcourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    removeLecturesfromCourse
}