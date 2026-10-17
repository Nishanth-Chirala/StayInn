// 1st importing backend url from the env - to use it for backend API call
// Using axios package for api call
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// For creating AppContext -> createContext hook is used
const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    // Getting user from the clerk
    const {user} = useUser();
    // Extracting token 
    const { getToken } = useAuth();

    // State Variables
    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Function to fetch data from API and store in rooms state()
    const fetchRooms = async () => {
        try {
            // API call
            const { data } = await axios.get('/api/rooms')
            // Checking response data
            if (data.success) {
                setRooms(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch users and also check user roles
    const fetchUser = async () => {
        try {
            // Making API call
            const {data} = await axios.get('/api/user', {headers: {Authorization: `Bearer ${await getToken()}`}})
            // Checking the data
            if(data.success){
                setIsOwner(data.role === "hotelOwner")
                setSearchedCities(data.recentSearchedCities)
            } else {
                // Retry Fetching  User Details after 5 seconds
                setTimeout(() => {
                    fetchUser()
                }, 5000);
            }
        } catch (error) {
            // Toast Notification
            toast.error(error.message)
        }
    }

    // Executing fetchUser function - whenever the component gets loaded
    useEffect(() => {
        if(user){
            fetchUser();
        }
    },[user])

    // Executing fetchRooms function - whenever the component gets loaded
    useEffect(() => {
        fetchRooms()
    },[])

    // Value Object
    const value = {
        currency, navigate, user, getToken, isOwner, setIsOwner, axios, showHotelReg, setShowHotelReg,searchedCities, setSearchedCities, rooms, setRooms
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)