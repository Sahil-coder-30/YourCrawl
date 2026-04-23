import mongoose from "mongoose";
import { config } from "./config.js";




export const connectToDb =async ()=>{
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB");
}