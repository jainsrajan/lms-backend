import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../index.js";
import AppError from "../utils/error.utils.js";
import crypto from 'crypto'
import subscriptions from "razorpay/dist/types/subscriptions.js";

export const getRazorpayApiKey = async(req , res , next)=>{
    res.status(200).json({
        success:true,
        message:key = process.env.RAZORPAY_KEY_ID
    });
}

export const buySubscription = async(req , res , next)=>{
  
    const{id} = req.user

    const user = await User.findById(id);

    if(!user)
    {
        return next(new AppError('Unauthorized , please login'))
    }

        if(user.role === "ADMIN")
        {
            return next(new AppError("Admin cannot purchase a subscription") , 400)
        }

        const subscription =  await razorpay.subscriptions.create({
            plain_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify:1
        })

        user.subscription.id = subscription.id
        user.subscription.status = subscription.status

        await user.save()
        res.status(200).json({
            success:true,
            message:"Subscription Successfully",
            subscription_id:subscription.id
        })
}

export const verifySubscription = async(req , res , next)=>{

    const{id} = req.user.id
    const{razorpay_payment_id , razorpay_signature , razorpay_subscription_id} = req.body

    const user = await User.findById(id)

    if(!user)
    {
        return next(new AppError('Unauthorized , please login'))
    }
    
    const subscriptionId = user.subscription.id

    const generatedSignature = crypto
    .createHmac('sha256' , process.env.RAZORPAY_SECRET)
    .update(`${razorpay_payment_id} | ${subscriptionId}`)
    .digest('hex')

    if(generatedSignature !== razorpay_signature)

    {
        return next(new AppError('Payment not verified please try again' , 500))
    }

    await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id
    })

    user.subscription.status = 'active'
    await user.save()

    res.status(200).json({
        success:true,
        message:"Payment verified successfully!"
    })
}

export const cancelSubscription = async(req , res , next)=>{

    const{id} = req.user.id

    const user = await User.findById(id);

    if(!user)
    {
        return next(new AppError('Unauthorized , please login'))
    }

    if(user.role === "ADMIN")
    {
        return next(new AppError("Admin cannot purchase cancel subscription") , 400)
    }

    const subscriptionId = user.subscription.id

    const subscription = await razorpay.subscriptions.cancel(
        subscriptionId
    )

    user.subscription.status = subscription.status

    await user.save()
}

export const allPayments = async(req , res , next)=>{

    const {count} = req.query
    const subscription = await razorpay.subsscriptions.all({
        count: count || 10
    })

     res.status(200).json({
        success:true,
        message:"All Payments",
        subscription
     })
    
}

