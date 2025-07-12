# Postman Order API Examples

## Base URL
```
http://localhost:5000/api/orders
```

## Headers
```
Content-Type: application/json
```

---

## 1. Create New Order

### Request
**Method:** `POST`  
**URL:** `http://localhost:5000/api/orders`

### Headers
```
Content-Type: application/json
```

### Body (Basic Order)
```json
{
  "phone": "0123456789",
  "name": "Nguyen Van A",
  "items": [
    {
      "productName": "Pho Bo",
      "productId": "PHO001",
      "quantity": 2,
      "unitPrice": 15.00,
      "specialInstructions": "Extra noodles, less spicy",
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
  "notes": "Please make it less spicy",
  "estimatedPickupTime": "2025-01-30T14:30:00.000Z"
}
```

### Body (Complex Order with Multiple Items)
```json
{
  "phone": "0987654321",
  "name": "Tran Thi B",
  "items": [
    {
      "productName": "Bun Cha",
      "productId": "BUN001",
      "quantity": 1,
      "unitPrice": 18.00,
      "specialInstructions": "Extra fish sauce",
      "category": "Main Course"
    },
    {
      "productName": "Spring Rolls",
      "productId": "SPR001",
      "quantity": 3,
      "unitPrice": 8.00,
      "specialInstructions": "Extra peanut sauce",
      "category": "Appetizer"
    },
    {
      "productName": "Iced Tea",
      "productId": "TEA001",
      "quantity": 2,
      "unitPrice": 3.00,
      "category": "Beverages"
    }
  ],
  "paymentMethod": "mobile_payment",
  "notes": "Delivery to table 5",
  "estimatedPickupTime": "2025-01-30T15:00:00.000Z"
}
```

### Expected Response
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "65f8a1b2c3d4e5f6a7b8c9d1",
    "phone": "0123456789",
    "name": "Nguyen Van A",
    "orderNumber": "ORD1706627400000123",
    "status": "pending",
    "totalAmount": 38.50,
    "subtotal": 35.00,
    "tax": 3.50,
    "discount": 0,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "notes": "Please make it less spicy",
    "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
    "createdAt": "2025-01-30T07:30:00.000Z",
    "updatedAt": "2025-01-30T07:30:00.000Z"
  },
  "orderDetails": [
    {
      "productName": "Pho Bo",
      "productId": "PHO001",
      "quantity": 2,
      "unitPrice": 15.00,
      "specialInstructions": "Extra noodles, less spicy",
      "category": "Main Course",
      "totalPrice": 30.00
    },
    {
      "productName": "Vietnamese Coffee",
      "productId": "COF001",
      "quantity": 1,
      "unitPrice": 5.00,
      "specialInstructions": "",
      "category": "Beverages",
      "totalPrice": 5.00
    }
  ]
}
```

---

## 2. Get All Orders (Admin) - Excluding Completed Orders

### Request
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders`

### Query Parameters
```
?page=1&limit=10&status=pending&phone=0123456789
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Expected Response
```json
{
  "orders": [
    {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "userId": {
        "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
        "phone": "0123456789",
        "name": "Nguyen Van A",
        "rewardPoints": 25
      },
      "phone": "0123456789",
      "name": "Nguyen Van A",
      "orderNumber": "ORD1706627400000123",
      "status": "pending",
      "totalAmount": 38.50,
      "subtotal": 35.00,
      "tax": 3.50,
      "discount": 0,
      "paymentMethod": "cash",
      "paymentStatus": "pending",
      "notes": "Please make it less spicy",
      "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
      "createdAt": "2025-01-30T07:30:00.000Z",
      "updatedAt": "2025-01-30T07:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

**Note:** This endpoint automatically excludes orders with status "completed". Only active orders (pending, confirmed, preparing, ready, cancelled) are returned.

---

## 3. Get Order by ID

### Request
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/65f8a1b2c3d4e5f6a7b8c9d0`

### Expected Response
```json
{
  "order": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "userId": {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
      "phone": "0123456789",
      "name": "Nguyen Van A",
      "rewardPoints": 25
    },
    "phone": "0123456789",
    "name": "Nguyen Van A",
    "orderNumber": "ORD1706627400000123",
    "status": "pending",
    "totalAmount": 38.50,
    "subtotal": 35.00,
    "tax": 3.50,
    "discount": 0,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "notes": "Please make it less spicy",
    "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
    "createdAt": "2025-01-30T07:30:00.000Z",
    "updatedAt": "2025-01-30T07:30:00.000Z"
  },
  "orderDetails": [
    {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d2",
      "orderId": "65f8a1b2c3d4e5f6a7b8c9d0",
      "productName": "Pho Bo",
      "productId": "PHO001",
      "quantity": 2,
      "unitPrice": 15.00,
      "totalPrice": 30.00,
      "specialInstructions": "Extra noodles, less spicy",
      "category": "Main Course",
      "createdAt": "2025-01-30T07:30:00.000Z"
    },
    {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d3",
      "orderId": "65f8a1b2c3d4e5f6a7b8c9d0",
      "productName": "Vietnamese Coffee",
      "productId": "COF001",
      "quantity": 1,
      "unitPrice": 5.00,
      "totalPrice": 5.00,
      "specialInstructions": "",
      "category": "Beverages",
      "createdAt": "2025-01-30T07:30:00.000Z"
    }
  ]
}
```

---

## 4. Get Orders by User Phone

### Request
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/user/0123456789`

### Expected Response
```json
[
  {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "65f8a1b2c3d4e5f6a7b8c9d1",
    "phone": "0123456789",
    "name": "Nguyen Van A",
    "orderNumber": "ORD1706627400000123",
    "status": "pending",
    "totalAmount": 38.50,
    "subtotal": 35.00,
    "tax": 3.50,
    "discount": 0,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "notes": "Please make it less spicy",
    "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
    "createdAt": "2025-01-30T07:30:00.000Z",
    "updatedAt": "2025-01-30T07:30:00.000Z"
  }
]
```

---

## 5. Update Order Status

### Request
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/orders/65f8a1b2c3d4e5f6a7b8c9d0/status`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Body
```json
{
  "status": "confirmed"
}
```

### Expected Response
```json
{
  "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "userId": "65f8a1b2c3d4e5f6a7b8c9d1",
  "phone": "0123456789",
  "name": "Nguyen Van A",
  "orderNumber": "ORD1706627400000123",
  "status": "confirmed",
  "totalAmount": 38.50,
  "subtotal": 35.00,
  "tax": 3.50,
  "discount": 0,
  "paymentMethod": "cash",
  "paymentStatus": "pending",
  "notes": "Please make it less spicy",
  "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
  "createdAt": "2025-01-30T07:30:00.000Z",
  "updatedAt": "2025-01-30T07:35:00.000Z"
}
```

---

## 6. Update Payment Status

### Request
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/orders/65f8a1b2c3d4e5f6a7b8c9d0/payment`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Body
```json
{
  "paymentStatus": "paid"
}
```

### Expected Response
```json
{
  "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "userId": "65f8a1b2c3d4e5f6a7b8c9d1",
  "phone": "0123456789",
  "name": "Nguyen Van A",
  "orderNumber": "ORD1706627400000123",
  "status": "confirmed",
  "totalAmount": 38.50,
  "subtotal": 35.00,
  "tax": 3.50,
  "discount": 0,
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "notes": "Please make it less spicy",
  "estimatedPickupTime": "2025-01-30T14:30:00.000Z",
  "createdAt": "2025-01-30T07:30:00.000Z",
  "updatedAt": "2025-01-30T07:40:00.000Z"
}
```

---

## 7. Update Order Details

### Request
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/orders/65f8a1b2c3d4e5f6a7b8c9d0`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Body
```json
{
  "status": "preparing",
  "paymentStatus": "paid",
  "notes": "Order is being prepared - extra spicy as requested",
  "estimatedPickupTime": "2025-01-30T15:00:00.000Z",
  "discount": 2.00,
  "totalAmount": 36.50
}
```

### Expected Response
```json
{
  "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "userId": "65f8a1b2c3d4e5f6a7b8c9d1",
  "phone": "0123456789",
  "name": "Nguyen Van A",
  "orderNumber": "ORD1706627400000123",
  "status": "preparing",
  "totalAmount": 36.50,
  "subtotal": 35.00,
  "tax": 3.50,
  "discount": 2.00,
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "notes": "Order is being prepared - extra spicy as requested",
  "estimatedPickupTime": "2025-01-30T15:00:00.000Z",
  "createdAt": "2025-01-30T07:30:00.000Z",
  "updatedAt": "2025-01-30T07:45:00.000Z"
}
```

---

## 8. Delete Order

### Request
**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/orders/65f8a1b2c3d4e5f6a7b8c9d0`

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Expected Response
```json
{
  "message": "Order deleted successfully"
}
```

---

## 9. Get Order Statistics

### Request
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/stats/overview`

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Expected Response
```json
{
  "totalOrders": 15,
  "pendingOrders": 3,
  "completedOrders": 10,
  "totalRevenue": 425.75
}
```

---

## Error Responses

### 400 Bad Request (Missing Required Fields)
```json
{
  "message": "Phone, name, and items array are required"
}
```

### 400 Bad Request (Pending Order Check-in)
```json
{
  "message": "Cannot check in. You have a pending order that needs to be completed first.",
  "pendingOrder": {
    "orderNumber": "ORD1706627400000123",
    "status": "preparing",
    "totalAmount": 38.50,
    "createdAt": "2025-01-30T07:30:00.000Z"
  }
}
```

### 404 Not Found (Order Not Found)
```json
{
  "message": "Order not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## Vietnamese Food Menu Examples

### Pho Varieties
```json
{
  "productName": "Pho Bo (Beef Pho)",
  "productId": "PHO001",
  "quantity": 1,
  "unitPrice": 15.00,
  "category": "Main Course"
}
```

```json
{
  "productName": "Pho Ga (Chicken Pho)",
  "productId": "PHO002",
  "quantity": 1,
  "unitPrice": 14.00,
  "category": "Main Course"
}
```

### Appetizers
```json
{
  "productName": "Goi Cuon (Fresh Spring Rolls)",
  "productId": "SPR001",
  "quantity": 2,
  "unitPrice": 8.00,
  "category": "Appetizer"
}
```

```json
{
  "productName": "Cha Gio (Fried Spring Rolls)",
  "productId": "SPR002",
  "quantity": 3,
  "unitPrice": 7.00,
  "category": "Appetizer"
}
```

### Beverages
```json
{
  "productName": "Ca Phe Sua Da (Vietnamese Iced Coffee)",
  "productId": "COF001",
  "quantity": 1,
  "unitPrice": 5.00,
  "category": "Beverages"
}
```

```json
{
  "productName": "Tra Da (Iced Tea)",
  "productId": "TEA001",
  "quantity": 2,
  "unitPrice": 3.00,
  "category": "Beverages"
}
```

---

## Complete Order Example (Vietnamese Restaurant)

```json
{
  "phone": "0901234567",
  "name": "Le Thi Minh",
  "items": [
    {
      "productName": "Pho Bo",
      "productId": "PHO001",
      "quantity": 1,
      "unitPrice": 15.00,
      "specialInstructions": "Extra beef, less noodles",
      "category": "Main Course"
    },
    {
      "productName": "Goi Cuon",
      "productId": "SPR001",
      "quantity": 2,
      "unitPrice": 8.00,
      "specialInstructions": "Extra peanut sauce",
      "category": "Appetizer"
    },
    {
      "productName": "Ca Phe Sua Da",
      "productId": "COF001",
      "quantity": 1,
      "unitPrice": 5.00,
      "category": "Beverages"
    }
  ],
  "paymentMethod": "mobile_payment",
  "notes": "Table 3, please make it spicy",
  "estimatedPickupTime": "2025-01-30T16:00:00.000Z"
}
```

---

## Check-in with Pending Order Check

### Request
**Method:** `POST`  
**URL:** `http://localhost:5000/api/checkin/checkin`

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "phone": "0123456789"
}
```

### Expected Response (No Pending Orders)
```json
{
  "rewardPoints": 25,
  "queuePosition": 3,
  "estimatedWaitTime": 15,
  "customerName": "Nguyen Van A",
  "customerPhone": "0123456789"
}
```

### Expected Response (With Pending Order)
```json
{
  "message": "Cannot check in. You have a pending order that needs to be completed first.",
  "pendingOrder": {
    "orderNumber": "ORD1706627400000123",
    "status": "preparing",
    "totalAmount": 38.50,
    "createdAt": "2025-01-30T07:30:00.000Z"
  }
}
```

---

## Get User Info with Pending Order Status

### Request
**Method:** `GET`  
**URL:** `http://localhost:5000/api/checkin/user/0123456789`

### Expected Response (No Pending Orders)
```json
{
  "rewardPoints": 25,
  "queuePosition": 3,
  "estimatedWaitTime": 15,
  "customerName": "Nguyen Van A",
  "customerPhone": "0123456789",
  "hasPendingOrder": false,
  "pendingOrder": null
}
```

### Expected Response (With Pending Order)
```json
{
  "rewardPoints": 25,
  "queuePosition": null,
  "estimatedWaitTime": null,
  "customerName": "Nguyen Van A",
  "customerPhone": "0123456789",
  "hasPendingOrder": true,
  "pendingOrder": {
    "orderNumber": "ORD1706627400000123",
    "status": "preparing",
    "totalAmount": 38.50,
    "createdAt": "2025-01-30T07:30:00.000Z"
  }
}
``` 