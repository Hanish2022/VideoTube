import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Ensure MONGODB_URI does not end with a slash before appending DB_NAME
        const mongoURI = `${process.env.MONGODB_URI.replace(/\/$/, '')}/${DB_NAME}`;
        
        const connectionInstance = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected successfully. DB hosted: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
}

export default connectDB;
