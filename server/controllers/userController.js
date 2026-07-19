// Get /api/user/  

// Function to get user role and searched cities  (1st controller)
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success: true, role, recentSearchedCities})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Function Store User Recent Searched Cities into database (2nd controller)
export const storeRecentSearchedCities = async (req, res) => {
    try {
        // middleware ( to add user data in the request body )
        const {recentSearchedCities} = req.body
        // Getting user 
        const user = await req.user

        // Checking search history length
        if(user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCities)
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCities)
        }

        // Updating data into database
        await user.save();
        res.json({ success: true, message: "City added" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}