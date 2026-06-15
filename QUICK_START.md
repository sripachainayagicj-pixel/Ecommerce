# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
```
Server will be running on `http://localhost:5000`

### 4. Start Frontend
Open another terminal:
```bash
cd frontend

# Using Python
python -m http.server 8000
```
Access at `http://localhost:8000`

---

## 📋 Default Test Accounts

### Regular User
- Email: `user@example.com`
- Password: `password123`

### Admin User
- Email: `admin@example.com`
- Password: `admin123`

(Create these accounts through the register page)

---

## 🛠️ Key Files Explained

### Backend
- **server.js** - Main Express app with all routes and middleware
- **models/** - Database schemas (User, Product, Order)
- **controllers/** - Business logic for auth, products, and orders
- **routes/** - API endpoint definitions
- **middleware/auth.js** - JWT verification and role checking

### Frontend
- **script.js** - All JavaScript functionality (1000+ lines)
  - Authentication functions
  - API calls
  - Cart management
  - Admin dashboard
- **style.css** - Responsive design (700+ lines)
- **HTML files** - 7 pages for complete e-commerce flow

---

## 🔑 Important Features

✅ **User Authentication** - Register, login, JWT tokens, role-based access

✅ **Products** - Full CRUD operations with search and filtering

✅ **Shopping Cart** - Add/remove items, quantity management, local storage

✅ **Orders** - Create orders, track status, admin management

✅ **Admin Dashboard** - Manage products and orders

✅ **Responsive Design** - Works on desktop, tablet, mobile

✅ **Error Handling** - Comprehensive error messages and validation

✅ **Comments** - Detailed code comments explaining logic

---

## 📝 File Summary

```
Frontend (4 HTML files, 1 CSS, 1 JS)
├── index.html (240 lines) - Home page with hero section
├── products.html (110 lines) - Product listing with filters
├── cart.html (140 lines) - Shopping cart management
├── checkout.html (180 lines) - Order checkout
├── login.html (85 lines) - User login
├── register.html (95 lines) - User registration
├── admin.html (200 lines) - Admin dashboard
├── style.css (700+ lines) - Complete styling
└── script.js (1000+ lines) - All frontend logic

Backend (7 files + config)
├── server.js (120 lines) - Express server setup
├── package.json (22 lines) - Dependencies
├── .env - Environment variables
├── models/
│   ├── User.js (70 lines) - User schema with password hashing
│   ├── Product.js (60 lines) - Product schema
│   └── Order.js (80 lines) - Order schema
├── controllers/
│   ├── authController.js (150 lines) - Auth logic
│   ├── productController.js (150 lines) - Product operations
│   └── orderController.js (150 lines) - Order operations
├── routes/
│   ├── authRoutes.js (20 lines) - Auth endpoints
│   ├── productRoutes.js (30 lines) - Product endpoints
│   └── orderRoutes.js (30 lines) - Order endpoints
└── middleware/
    └── auth.js (50 lines) - JWT verification

Documentation
├── README.md - Complete project documentation (500+ lines)
└── QUICK_START.md - This file
```

---

## 🎯 Project Highlights

### For Internship Evaluation
- ✅ Full-stack development (frontend + backend)
- ✅ Database design and integration
- ✅ RESTful API design
- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ CRUD operations
- ✅ Error handling and validation
- ✅ Responsive UI/UX
- ✅ Code organization and comments
- ✅ Professional documentation

### Technologies Demonstrated
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Security: JWT, bcryptjs, CORS
- Best Practices: RESTful API, MVC pattern, middleware

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders (user/admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order status (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

---

## 💡 Usage Flow

1. **User Journey**
   - Register/Login → Browse Products → Add to Cart → Checkout → Order Confirmation

2. **Admin Journey**
   - Login as Admin → Manage Products → Manage Orders → Update Status

3. **Technical Flow**
   - Frontend sends request → Backend validates token → Database operation → Response with data

---

## 📋 Code Quality

- ✅ Well-organized folder structure
- ✅ Comments on important sections
- ✅ Error handling throughout
- ✅ Reusable functions and components
- ✅ Consistent naming conventions
- ✅ Input validation on backend
- ✅ Security best practices (JWT, password hashing)
- ✅ Responsive design patterns

---

## 🎓 Educational Value

This project teaches:
- How to build a complete web application
- REST API design and implementation
- Database modeling and relationships
- Authentication and authorization
- Frontend to backend communication
- State management (localStorage)
- Error handling and debugging
- Security considerations
- Code organization

---

## 🚨 Important Notes

1. **Change JWT_SECRET in production** - Do not use the default secret
2. **MongoDB connection** - Update connection string as needed
3. **CORS settings** - Configure properly for production
4. **Password requirements** - Implement stronger requirements if needed
5. **Input validation** - Add more validation for production

---

## ✨ Ready to Submit!

This e-commerce application is complete and ready for evaluation with:
- Full working backend with APIs
- Complete frontend with all pages
- MongoDB integration
- User authentication
- Admin dashboard
- Shopping cart functionality
- Order management
- Professional documentation
- Well-commented code

Perfect for internship portfolio! 🎓
