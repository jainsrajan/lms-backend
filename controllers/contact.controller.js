import contactUs from "../models/contact.model.js";
import AppError from "../utils/error.utils.js";

const contact =  async(req , res , next)=>{

 try {

    const{name , email , message} = req.body

    if(!name || !email || !message)
        {
            return next(new AppError("All fields are required" , 400));
        }

        const contact = await contactUs.create({
            name,
            email,
            message,
           
        })

        await contact.save();

        res.status(200).json({
            success:true,
            message:"Form Submmited successfully"
        })
    
 } catch (error){
    
    return next(new AppError(error.message))
 }
    
}

export default contact;