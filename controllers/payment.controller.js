import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { instance } from "../index.js";
import AppError from "../utils/error.utils.js";
import crypto from 'crypto'
// import subscriptions from "razorpay/dist/types/subscriptions.js";

export const getRazorpayApiKey = async(req , res , next)=>{

    try {
        res.status(200).json({
            success:true,
            message:process.env.RAZORPAY_KEY_ID
        });
        
    } catch (error) {
        return next(new AppError(error.message))
        
    }
   
}

export const buySubscription = async(req , res , next)=>{
  
    try {

        const id = req.user.id

        const user = await User.findById(id);
        // console.log("The use is-----",user)
    
        if(!user)
        {
            return next(new AppError('Unauthorized , please login'))
        }
    
            if(user.role == "ADMIN")
            {
                return next(new AppError("Admin cannot purchase a subscription") , 400)
            }
    
            const subscription = await instance.subscriptions.create({
                plan_id: process.env.RAZORPAY_PLAIN_ID,
                total_count:25,
                customer_notify:1
            })

    console.log("The subscription is" , subscription)
            user.subscription.id = subscription.id
            user.subscription.status = subscription.status
    
            await user.save()
            res.status(200).json({
                success:true,
                message:"Subscription Successfully",
                subscription_id:subscription.id
            })
        
    } catch (error) {

        return next (new AppError(error))
        
    }
   
}

export const verifySubscription = async(req , res , next)=>{

    try {

        const id = req.user.id
        const{razorpay_payment_id  , razorpay_subscription_id , razorpay_signature} = req.body
    
        
        const user = await User.findById(id)
    
        if(!user)
        {
            return next(new AppError('Unauthorized , please login'))
        }
        
        const subscriptionId = user.subscription.id
        
        console.log("The subcription id is" , subscriptionId)
        console.log("The razorpay subcription id is" , razorpay_subscription_id)
        
        const generatedSignature = crypto
        .createHmac('sha256' , process.env.RAZORPAY_SECRET)
        .update(`${subscriptionId} | ${razorpay_payment_id}`)

    
        .digest('hex')

    //    const generatedSignature = HMAC-SHA256(subscriptionId + "|" + razorpay_payment_id , process.env.RAZORPAY_SECRET);

        console.log("The generate signature key is" , generatedSignature)
    
        if(generatedSignature === razorpay_signature)
    
        {
            return next(new AppError('Payment not verified please try again' , 500))
        }
    
        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
           
        })
    
        user.subscription.status = 'active'
        await user.save()
    
        res.status(200).json({
            success:true,
            message:"Payment verified successfully!"
        })
        
    } catch (error) {
        return next(new AppError(error.message))
    }
   
}

export const cancelSubscription = async(req , res , next)=>{


    try {

        const id = req.user.id

    const user = await User.findById(id);

    if(!user)
    {
        return next(new AppError('Unauthorized , please login'))
    }

    if(user.role === "ADMIN")
    {
        return next(new AppError("Admin cannot cancel subscription") , 400)
    }

    const subscriptionId = user.subscription.id

    const subscription = await instance.subscriptions.cancel(
        subscriptionId
    )

    user.subscription.status = subscription.status

    await user.save()

    res.status(200).json({
        success:true,
        message:"Subscription cancelled Successfully"
    })
        
    } catch (error) {

         return next(new AppError(error.message))
    }
    
}

export const allPayments = async(req , res , next)=>{

    const {count} = req.query
    const subscription = await instance.subsscriptions.all({
        count: count || 10
    })

     res.status(200).json({
        success:true,
        message:"All Payments",
        subscription
     })
    
}

