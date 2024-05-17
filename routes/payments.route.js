import  {  Router }  from "express";
import { allPayments, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from "../controllers/payment.controller.js";
import { authorizedRoles, isloggedIn } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/razorpay-key')
      .get(
        isloggedIn,
        getRazorpayApiKey)

      router.route('/subscribe')
      .post(
        isloggedIn,
        buySubscription)

      router.route('/verify')
      .post(
        isloggedIn,
        verifySubscription)

      router
      .route('/unsubscribe')
      .post(
        isloggedIn,
        cancelSubscription)

      router.route('/')
      .get(
        isloggedIn,
        authorizedRoles("ADMIN"),
        allPayments)

      export default router