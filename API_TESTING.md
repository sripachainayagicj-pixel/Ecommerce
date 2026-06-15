# API Testing Guide

## Testing the E-Commerce APIs

This guide shows you how to test all the API endpoints using tools like Postman or curl commands.

---

## 🛠️ Tools Needed

- **Postman** (Recommended) - https://www.postman.com/downloads/
- **cURL** - Command line tool (built-in on most systems)
- **VS Code REST Client** - Extension for VS Code

---

## 📌 Important Setup

Before testing, make sure:
1. MongoDB is running
2. Backend server is running on `http://localhost:5000`
3. Keep the JWT token from login responses for authenticated requests

---

## 🔐 Authentication Testing

### 1. Register New User

**URL:** `POST http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

---

### 2. Login User

**URL:** `POST http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**💡 Save the token! You'll need it for authenticated requests.**

---

### 3. Get Current User

**URL:** `GET http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-06-04T10:30:00.000Z"
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 Product Testing

### 4. Get All Products

**URL:** `GET http://localhost:5000/api/products`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?search=laptop&category=Electronics
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dell Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "image": "https://example.com/laptop.jpg",
      "category": "Electronics",
      "stock": 10,
      "createdAt": "2024-06-04T10:00:00.000Z"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/products?search=laptop&category=Electronics"
```

---

### 5. Get Single Product

**URL:** `GET http://localhost:5000/api/products/{productId}`

**Example:** `GET http://localhost:5000/api/products/507f1f77bcf86cd799439012`

**Expected Response:**
```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dell Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 10
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/products/507f1f77bcf86cd799439012
```

---

### 6. Create Product (Admin Only)

**URL:** `POST http://localhost:5000/api/products`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "iPhone 14 Pro",
  "description": "Latest iPhone with advanced features",
  "price": 1299.99,
  "category": "Electronics",
  "stock": 50,
  "image": "https://example.com/iphone.jpg"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "iPhone 14 Pro",
    "price": 1299.99,
    ...
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 14 Pro",
    "description": "Latest iPhone with advanced features",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 50,
    "image": "https://example.com/iphone.jpg"
  }'
```

---

### 7. Update Product (Admin Only)

**URL:** `PUT http://localhost:5000/api/products/{productId}`

**Example:** `PUT http://localhost:5000/api/products/507f1f77bcf86cd799439012`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "price": 899.99,
  "stock": 15
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:5000/api/products/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99,
    "stock": 15
  }'
```

---

### 8. Delete Product (Admin Only)

**URL:** `DELETE http://localhost:5000/api/products/{productId}`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/products/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 🛒 Order Testing

### 9. Create Order

**URL:** `POST http://localhost:5000/api/orders`

**Headers:**
```
Authorization: Bearer USER_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "name": "Dell Laptop",
      "price": 999.99,
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439013",
      "name": "Mouse",
      "price": 29.99,
      "quantity": 1
    }
  ],
  "totalAmount": 2029.77,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "Credit Card"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "orderId": "ORD-1717501200000",
    "userId": "507f1f77bcf86cd799439011",
    "totalAmount": 2029.77,
    "status": "Pending",
    "createdAt": "2024-06-04T10:30:00.000Z"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "name": "Dell Laptop",
        "price": 999.99,
        "quantity": 2
      }
    ],
    "totalAmount": 2029.77,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "Credit Card"
  }'
```

---

### 10. Get All Orders

**URL:** `GET http://localhost:5000/api/orders`

**Headers:**
```
Authorization: Bearer TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "orderId": "ORD-1717501200000",
      "userId": "507f1f77bcf86cd799439011",
      "totalAmount": 2029.77,
      "status": "Pending"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

### 11. Get Single Order

**URL:** `GET http://localhost:5000/api/orders/{orderId}`

**Headers:**
```
Authorization: Bearer TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "orderId": "ORD-1717501200000",
    "userId": { ... },
    "products": [ ... ],
    "totalAmount": 2029.77,
    "status": "Pending"
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/orders/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

### 12. Update Order Status (Admin Only)

**URL:** `PUT http://localhost:5000/api/orders/{orderId}`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "Shipped",
  "notes": "Shipped via FedEx with tracking #123456"
}
```

**Status Options:** `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

**Expected Response:**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "Shipped",
    "notes": "Shipped via FedEx with tracking #123456"
  }
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped",
    "notes": "Shipped via FedEx with tracking #123456"
  }'
```

---

### 13. Delete Order (Admin Only)

**URL:** `DELETE http://localhost:5000/api/orders/{orderId}`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/orders/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 📊 Testing Checklist

- [ ] Register new user
- [ ] Login and save token
- [ ] Get current user info
- [ ] Get all products (no filter)
- [ ] Search products
- [ ] Filter products by category
- [ ] Get single product
- [ ] Create product (as admin)
- [ ] Update product (as admin)
- [ ] Delete product (as admin)
- [ ] Create order (as user)
- [ ] Get all orders (as user)
- [ ] Get single order (as user)
- [ ] Update order status (as admin)
- [ ] Delete order (as admin)

---

## 🚨 Common Issues & Solutions

### "No token provided"
- Make sure you're adding Authorization header: `Bearer YOUR_TOKEN`

### "Token is invalid or expired"
- Generate a new token by logging in again
- Check if token is correct (copy without extra spaces)

### "Access denied. Admin privileges required"
- Use an admin account token
- Make sure user role is set to "admin"

### "Product not found"
- Verify product ID is correct
- Check if product exists in database

### "Invalid email or password"
- Double-check email and password
- Ensure account exists

### "Please provide all required fields"
- Check all required fields are included in request body
- Verify field names match exactly

---

## 🎓 Testing Tips

1. **Use Postman Collections** - Save all requests for easy access
2. **Keep tokens handy** - Save admin and user tokens
3. **Test in order** - Register → Login → Create Product → Create Order
4. **Check timestamps** - Notice `createdAt` and `updatedAt` fields
5. **Verify relationships** - Check product references in orders
6. **Test error cases** - Try invalid data to see error messages

---

## 📝 Sample Test Workflow

```
1. POST /api/auth/register
   - Register user: john@example.com
   - Save USER_TOKEN from response

2. POST /api/auth/register (with admin role in DB manually)
   - Register admin: admin@example.com
   - Save ADMIN_TOKEN from response

3. POST /api/products (with ADMIN_TOKEN)
   - Create a product
   - Save productId

4. GET /api/products
   - Verify product appears in list

5. POST /api/orders (with USER_TOKEN)
   - Create order with product
   - Save orderId

6. PUT /api/orders/{orderId} (with ADMIN_TOKEN)
   - Update order status to "Shipped"

7. GET /api/orders/{orderId} (with USER_TOKEN)
   - Verify order status updated
```

---

**Happy Testing!** 🧪
