import Router from 'express';
import { addLectureToCourseById, createCourse, getAllcourses, getLecturesByCourseId, removeCourse, removeLecturesfromCourse, updateCourse } from '../controllers/course.controller.js';
import { authorizeSubscriber, authorizedRoles, isloggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router =  Router()

router.route('/') 
.get(getAllcourses)

.post(isloggedIn,
    authorizedRoles("ADMIN"),
    upload.single('thumbnail'),
    createCourse) 

    // .delete(isloggedIn,
    // authorizeSubscriber("ADMIN"),
    //  removeLecturesfromCourse);

router.route('/:id') 
.get(isloggedIn ,authorizeSubscriber, getLecturesByCourseId)

.put(isloggedIn ,
     authorizedRoles("ADMIN") ,
      updateCourse)

.delete(isloggedIn , 
    authorizedRoles("ADMIN") , 
    removeCourse
)

.post(isloggedIn,
    authorizedRoles("ADMIN"),
    upload.single('lecture'),
    addLectureToCourseById)

export default router
