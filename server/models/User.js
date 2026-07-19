import mongoose from 'mongoose';

//Schema : for creating model
const userSchema = mongoose.Schema({
    _id: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    role: {type: String, enum: ["user","hotelOwner"], default: "user"},
    recentSearchedCities: [{type: String, required: true}],
},{timestamps: true}
);

// User model 
const User = mongoose.model("User", userSchema);

export default User;