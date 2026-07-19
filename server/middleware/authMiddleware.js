import { getAuth } from "@clerk/express";
import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    const {userId} = await getAuth(req)
    if(!userId){
        res.json({ success: false, message: "not authenticated"})
    }else{
        const user = await User.findById(userId);
        req.user = user;
        console.log(user)
        next()
    }
}