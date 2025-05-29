// root/src/db/db.js
import mongoose from "mongoose";
import { env } from "../utils/env.js";
async function connectDB(){
    try {
        let connectionStatus=await mongoose.connect(env.MONGOURI)
        if(connectionStatus){
            console.log("connected with db");
        } 
        else {
            console.log("errpor");
        }
    } catch (error) {
        console.log("MONGO ERROR : "+error);
    }
}

export default connectDB