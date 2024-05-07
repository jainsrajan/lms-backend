import mongoose from "mongoose";

mongoose.set('strictQuery' , false)

const connectiontoDB = async()=>{

    try {

        const {connection} = await mongoose.connect(
            process.env.MONGO_URI
        )
    
        if(connection)
        {
            console.log(`Connected to MongoDB: ${connection.host}`);
        }
        
    } catch (error) {
        console.log(error)
        process.exist(1)
    }
}

export default connectiontoDB