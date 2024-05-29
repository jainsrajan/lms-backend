import { Router } from "express"
import { getProfile, login, logout, register,forgotPassword , resetPassword, changepassword , updateuser} from "../controllers/user.controller.js";
import { isloggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register' , upload.single("avatar"),register)
router.post('/login' , login)
router.get('/logout' , logout)
// router.post('/register' , register)
router.get('/me' , isloggedIn, getProfile)
router.post('/reset' , forgotPassword)
router.post('/reset-password/:resetToken' , resetPassword)
router.post('/changepassword' ,isloggedIn, changepassword)
router.put('/update/:id' , isloggedIn , upload.single('avatar') , updateuser)



export default router