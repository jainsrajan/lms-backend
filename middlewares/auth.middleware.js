import AppError from "../utils/error.utils.js"
import  jwt  from "jsonwebtoken"

const isloggedIn = async (req , res , next)=>{
    const {token} = req.cookies


    if(!token)
    {
        return next(new AppError('Unauthenticated,please login again' , 401))
    }

    const userDetails = await jwt.verify(token , process.env.JWT_SECRET)
    console.log(userDetails)
    req.user = userDetails
    next()
}

const authorizedRoles = (...roles) =>async(req , res , next)=>{
        
       const currentUserRole = req.user.role
       if(!roles.includes(currentUserRole))

    {
        return next (new AppError('You do not have permission to access this route' , 500))
       }
       next()
}


const authorizeSubscriber = async(req , res , next)=>{
    const currentUserRole = req.user.role
const subscription = req.user.subscription

if(currentUserRole !=='ADMIN' && subscription.status!=='active')
{
    return next(new AppError('Please subscribe to access this route!' , 403))
}

next()

}

export {isloggedIn,
authorizedRoles,
authorizeSubscriber}
