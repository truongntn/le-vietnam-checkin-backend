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
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://le-vietnam-checkin-system.vercel.app",
        "https://le-vietnam-checkin-system-er0et5gmq-truongntns-projects.vercel.app",
        "https://le-vietnam-kitchen.vercel.app",
        "https://le-vietnam-customer.vercel.app",
        "https://le-vietnam-customer-oyxob39a0-truongntns-projects.vercel.app",
        "https://le-vietnam-notification.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  },
});

connectDB();

app.use(
  cors({
    origin: [
      "https://le-vietnam-checkin-system.vercel.app",
      "https://le-vietnam-checkin-system-er0et5gmq-truongntns-projects.vercel.app",
      "https://le-vietnam-kitchen.vercel.app",
      "https://le-vietnam-customer.vercel.app",
      "https://le-vietnam-customer-oyxob39a0-truongntns-projects.vercel.app",
      "https://le-vietnam-notification.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
  })
);
app.use(express.json());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("phone", async (phoneNumber) => {
    console.log("Received phone number:", phoneNumber);
    try {
      socket.emit("phoneResponse", {
        status: "success",
        message: "Phone number received",
      });

      socket.broadcast.emit("receivePhoneNumber", { phoneNumber });
    } catch (error) {
      socket.emit("phoneResponse", { status: "error", message: error.message });
    }
  });

  socket.on("checkin", async (phoneNumber) => {
    console.log("Received check-in with phone number:", phoneNumber);
    try {
      
    } catch (error) {
      socket.emit("phoneResponse", { status: "error", message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Configuration
const WP_URL = "https://fansynails.com.au";
const USERNAME = process.env.WP_USERNAME;
const APP_PASSWORD = process.env.WP_APP_PASSWORD;
const api = axios.create({
  baseURL: WP_URL,
  auth: {
    username: USERNAME,
    password: APP_PASSWORD,
  },
});

async function getBookingPressServices() {
  try {
    const response = await api.get("/wp-json/bookingpress/v1/services");
    console.log("Services:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", {
      message: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : null,
      url: error.config ? error.config.url : null,
    });
    throw error;
  }
}

async function getBookingPressAppointments() {
  try {
    const response = await api.get("/wp-json/bookingpress/v1/appointments");
    console.log("Appointments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", {
      message: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : null,
      url: error.config ? error.config.url : null,
    });
    throw error;
  }
}

async function createBookingPressAppointment(appointmentData) {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const appointmentTime = `${hours}:${minutes}`;

    if (!/^\d{2}:\d{2}$/.test(appointmentTime)) {
      throw new Error("Invalid time format. Use HH:MM.");
    }

    const response = await api.post("/wp-json/bookingpress/v1/add-booking", {
      service_id: 35,
      customer_phone: appointmentData.customer_phone,
      customer_firstname: appointmentData.customer_firstname || "Guest",
      customer_lastname: appointmentData.customer_lastname || "",
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
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const response = await axios.get(backendUrl);
    if (response.status === 200) {
      console.log(`Health check successful: ${response.status}`);
    } else {
      console.error(`Health check failed: Status ${response.status}`);
    }
  } catch (error) {
    console.error(`Health check error: ${error.message}`);
  }
});

app.get("/", async (req, res) => {
  res.send("API server is running successfully!");
});

app.post("/createBooking", async (req, res) => {
  try {
    const { customer_phone } = req.body;

    if (!customer_phone) {
      return res.status(400).json({
        status: "error",
        message: "Missing required field: customer_phone",
      });
    }

    const appointmentData = {
      customer_phone: customer_phone,
    };

    const result = await createBookingPressAppointment(appointmentData);
    res
      .status(200)
      .json({ status: "success", message: "Booking created", data: result });
  } catch (error) {
    console.error("POST /createBooking error:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
