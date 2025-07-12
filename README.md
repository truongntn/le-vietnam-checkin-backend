# Kiosk Check-In Backend

Backend and admin dashboard for the kiosk-checkin app, built with Node.js, MongoDB, and Horizon UI Chakra (React).

## Features
- User check-in via phone number (frontend at https://github.com/truongntn/kiosk-checkin)
- Reward points tracking (10 points per check-in by default)
- Queue management with estimated wait times
- Order management with detailed order tracking
- Payment status tracking and management
- Order statistics and reporting
- Admin dashboard to manage users, check-ins, reward points, queue, and orders
- CRUD operations for users, check-ins, and orders

## Prerequisites
- Node.js (>=14.x)
- MongoDB (>=4.x)
- Git

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/kiosk-checkin-backend.git
   cd kiosk-checkin-backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env` and update:
   ```env
   MONGO_URI=mongodb://localhost:27017/kiosk-checkin
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Start MongoDB**
   Ensure MongoDB is running:
   ```bash
   mongod
   ```

5. **Run the backend**
   ```bash
   npm start
   ```
   The server will run at `http://localhost:5000`.

6. **Set up the admin dashboard**
   ```bash
   cd admin-dashboard
   npm install
   npm start
   ```
   The dashboard will run at `http://localhost:3000`.

## API Endpoints

### Check-in & Queue Management
- `POST /api/checkin/checkin`: Check in a user by phone number
- `GET /api/checkin/user/:phone`: Get user details (reward points, queue status)
- `GET /api/checkin/users`: Get all users (admin)
- `GET /api/queue`: Get current queue (admin)
- `DELETE /api/queue/:id`: Remove a queue entry (admin)

### Authentication
- `POST /api/auth/login`: Admin login

### Order Management
- `POST /api/orders`: Create a new order
- `GET /api/orders`: Get all orders (with pagination and filtering)
- `GET /api/orders/:id`: Get order by ID with details
- `GET /api/orders/user/:phone`: Get orders by user phone
- `PUT /api/orders/:id/status`: Update order status
- `PUT /api/orders/:id/payment`: Update payment status
- `PUT /api/orders/:id`: Update order details
- `DELETE /api/orders/:id`: Delete order
- `GET /api/orders/stats/overview`: Get order statistics

## Order Management

### Creating an Order
```bash
POST /api/orders
Content-Type: application/json

{
  "phone": "1234567890",
  "name": "John Doe",
  "items": [
    {
      "productName": "Pho Bo",
      "productId": "PHO001",
      "quantity": 2,
      "unitPrice": 15.00,
      "note": "Extra noodles",
      "category": "Main Course"
    },
    {
      "productName": "Vietnamese Coffee",
      "productId": "COF001",
      "quantity": 1,
      "unitPrice": 5.00,
      "category": "Beverages"
    }
  ],
  "paymentMethod": "cash",
  "notes": "Please make it spicy",
  "estimatedPickupTime": "2025-01-30T14:30:00.000Z"
}
```

### Order Status Flow
1. **pending** - Order created, waiting for confirmation
2. **confirmed** - Order confirmed by staff
3. **preparing** - Order is being prepared
4. **ready** - Order is ready for pickup
5. **completed** - Order has been picked up
6. **cancelled** - Order has been cancelled

### Payment Status
- **pending** - Payment not yet received
- **paid** - Payment completed
- **failed** - Payment failed

### Order Statistics
The `/api/orders/stats/overview` endpoint provides:
- Total number of orders
- Number of pending orders
- Number of completed orders
- Total revenue from completed orders

## Admin Dashboard
- Login with `username: admin`, `password: password`
- View dashboard, queue, and user details
- Remove users from the queue

## Notes
- The frontend (https://github.com/truongntn/kiosk-checkin) should send POST requests to `/api/checkin/checkin` with `{ phone: "1234567890" }`.
- Wait time is estimated as 5 minutes per queue position.
- Secure the admin login with a proper user model in production.

## License
MIT
```

# Instructions to Use
1. **Extract the ZIP**:
   - Download and extract `kiosk-checkin-backend.zip` to a directory.
2. **Install Backend Dependencies**:
   ```bash
   cd kiosk-checkin-backend
   npm install
   ```
3. **Set Up MongoDB**:
   - Ensure MongoDB is running locally or use a cloud provider like MongoDB Atlas.
   - Copy `.env.example` to `.env` and update `MONGO_URI` and `JWT_SECRET`.
4. **Run Backend**:
   ```bash
   npm start
   ```
   - The server will start at `http://localhost:5000`.
5. **Set Up Admin Dashboard**:
   ```bash
   cd admin-dashboard
   npm install
   npm start
   ```
   - The dashboard will start at `http://localhost:3000`.
6. **Test the Application**:
   - Use the frontend at `https://github.com/truongntn/kiosk-checkin` to send POST requests to `http://localhost:5000/api/checkin/checkin`.
   - Access the admin dashboard at `http://localhost:3000`, log in with `admin`/`password`.
7. **Verify Functionality**:
   - Check-in a user via the frontend (POST `{ phone: "1234567890" }`).
   - Verify reward points, queue position, and wait time in the response.
   - Use the admin dashboard to view the queue and user data.

# Notes
- The admin dashboard uses Chakra UI to mimic Horizon UI’s style. For full Horizon UI integration, you may need to purchase their premium template and update the component styles.
- The backend assumes the frontend sends phone numbers in a consistent format. Add validation if needed.
- For production, enhance security by replacing the hardcoded admin login with a proper user model and adding rate-limiting.
- The wait time estimation (5 minutes per queue position) can be customized based on shop-specific data.

This ZIP file provides a complete backend and admin dashboard, ready to integrate with the frontend at `https://github.com/truongntn/kiosk-checkin`. The artifact retains the same `artifact_id` as the previous response since it’s an export of the same project.