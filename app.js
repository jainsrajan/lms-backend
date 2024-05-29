import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {config} from 'dotenv';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';


import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payments.route.js'
import contactRoutes from './routes/contact.route.js'

config();

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cors({
    origin:"https://musical-biscuit-f07d19.netlify.app",
    credentials: true
}))

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*" );
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT,DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type" , "X-Auth-Token" , "Origin" , "Authorization");
//     next();
//   })

app.use(morgan('dev'))

app.use(cookieParser())

app.use('/ping' ,function(req,res){
    res.send('Pong');
})

app.use('/api/v1/user' , userRoutes)
app.use('/api/v1/courses' , courseRoutes )
app.use('/api/v1/payments' ,paymentRoutes )
app.use('/api/v1/contactus' ,contactRoutes )
app.all('*' , (req,res)=>{

    res.status(404).send('OOPS!! Page not found');
})

app.use(errorMiddleware);


export default app;
