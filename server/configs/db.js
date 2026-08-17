import mongoose from 'mongoose';

// Function :- to connect project with mongodb database
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log("Database Connected"));
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;