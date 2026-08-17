import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: {type: String, ref: "Hotel", required: true},
    roomType: {type: String, required: true},
    pricePerNight: {type: Number, required: true},
    discount: {type: Number, default: 0, min: 0, max: 100},
    maxGuests: {type: Number, default: 2, min: 1},
    description: {type: String, default: ""},
    amenities: {type: Array, required: true},
    images: [{type: String}],
    isAvailable: {type: Boolean, default: true},
}, {timestamps: true});

const Room = mongoose.model("Room", roomSchema);

export default Room;