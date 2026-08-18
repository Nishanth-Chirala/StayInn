import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// Creating API controller function 
export const registerHotel = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        const {name, address, contact, city} = req.body;
        const owner = req.user._id;

        // Create hotel (users can now register multiple hotels)
        await Hotel.create({ name, address, contact, city, owner });

        // Updating role
        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

        return res.json({ success: true, message: "Hotel Registered Successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all hotels for the current user
export const getUserHotels = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        const hotels = await Hotel.find({ owner: req.user._id }).sort({createdAt: -1});
        return res.json({ success: true, hotels });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const subcribers = async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const user = await User.findOne({email});
    if (!user) {
        return res.status(404).json({ success: false, message: 'Login to Enjoy Benefits' });
    }
const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: 'New Hotels & Latest Updates',
    html: `
        <h2>Discover Our New Hotels</h2>

        <p>Dear ${user.username},</p>

        <p>
            We're excited to keep you updated with the latest hotels and
            exciting new stays added to our platform.
        </p>

        <p>
            Here are some of our newest hotels you might be interested in:
        </p>

        <ul>
            <li><strong>New hotels:</strong> Discover recently added properties</li>
            <li><strong>New destinations:</strong> Explore stays in new locations</li>
            <li><strong>Latest offers:</strong> Stay updated with upcoming deals</li>
        </ul>

        <p>
            Visit our website to explore the latest hotels and find your
            perfect stay.
        </p>

        <p>
            Thank you for staying connected with us!
        </p>

        <p>
            Best regards,<br />
            The Hotel Team
        </p>
    `
};

        // Sending email
        await transporter.sendMail(mailOptions)
    }