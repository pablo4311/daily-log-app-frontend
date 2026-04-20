import axios from 'axios';

// Create an axios instance with default settings
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // Set your base URL here
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;