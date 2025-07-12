require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const checkInRoutes = require("./routes/checkin");
const queueRoutes = require("./routes/queue");
const userRoutes = require("./routes/user");
const staffRoutes = require("./routes/staff");
const orderRoutes = require("./routes/order");
const cron = require("node-cron");
const axios = require("axios");

const app = express();

connectDB();

app.use(
  cors({
    origin: [
      "https://le-vietnam-checkin-system.vercel.app",
      "https://le-vietnam-checkin-system-er0et5gmq-truongntns-projects.vercel.app",
      "https://le-vietnam-kitchen.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
  })
);
app.use(express.json());

// Configuration
const WP_URL = "https://fansynails.com.au"; // Replace with your WordPress site URL
const USERNAME = "info@fansynails.com.au"; // WordPress username
const APP_PASSWORD = "Fansynails@2025"; // Application Password from WordPress
const API_BASE = `${WP_URL}/wp-json/wp/v2`; // Base URL for WordPress REST API
// Create an Axios instance with Basic Auth for Application Password
const api = axios.create({
  baseURL: WP_URL,
  auth: {
    username: USERNAME,
    password: APP_PASSWORD,
  },
});
// Function to fetch BookingPress services
async function getBookingPressServices() {
  try {
    // Replace with actual BookingPress endpoint, e.g., /bookingpress/v1/appointments
  console.log();
    const response = await api.get('/wp-json/mo/v1/get-booking-services'); // Hypothetical endpoint
    console.log('Services:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', {
      message: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : null,
      url: error.config ? error.config.url : null,
    });
    throw error;
  }
}
// Function to fetch BookingPress appointments
async function getBookingPressAppointments() {
  try {
    // Replace with actual BookingPress endpoint, e.g., /bookingpress/v1/appointments
    const response = await api.get('/bookingpress/v1/appointments'); // Hypothetical endpoint
    console.log('Appointments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', {
      message: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : null,
      url: error.config ? error.config.url : null,
    });
    throw error;
  }
}
// Function to create a new appointment (hypothetical)
async function createBookingPressAppointment(appointmentData) {
  try {
    // Use current date (2025-05-30) for appointment_date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // "2025-05-30"

    // Use current time (11:13) for appointment_time
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const appointmentTime = `${hours}:${minutes}`; // "11:13"

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(appointmentTime)) {
      throw new Error('Invalid time format. Use HH:MM.');
    }

    // Replace with actual BookingPress endpoint for creating appointments
    const response = await axios.post(WP_URL + "/wp-json/bookingpress/v1/add-booking", {
      service_id: 35, // "General Appointment"
      customer_phone: appointmentData.customer_phone,
      customer_name: appointmentData.customer_phone, 
      customer_firstname: appointmentData.customer_phone, 
      customer_lastname: "",
      appointment_date: formattedDate, 
      appointment_time: appointmentTime,
      payment_amount: 0.0,
      payment_status: "pending",
    });
    console.log("Created Appointment:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating appointment:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

app.use("/api/auth", authRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/user", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/orders", orderRoutes);

cron.schedule("*/5 * * * *", async () => {
  try {
    const response = await axios.get(process.env.BACKEND_URL);
    console.log(`Health check response: ${response.status}`);
  } catch (error) {
    console.error(`Health check error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', async (req, res) =>  {
  //await createBookingPressAppointment({customer_phone: '1234567890'});
  res.send('API server is running successfully!');
})

app.post('/createBooking', async (req, res) => {
  try {
    const { customer_phone } = req.body;

    if (!customer_phone) {
      return res.status(400).json({ status: 'error', message: 'Missing required field: customer_phone' });
    }

    const appointmentData = {
      customer_phone: customer_phone,
    };

    const result = await createBookingPressAppointment(appointmentData);
    res.status(200).json({ status: 'success', message: 'Booking created', data: result });
  } catch (error) {
    console.error('POST / error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});