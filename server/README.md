# Chikankari Artisans Backend API

This is the backend API for the Chikankari Artisans project, which connects artisans directly with customers.

## Features

- User authentication (customers and admins)
- Artisan registration and authentication
- Product management
- Order processing
- File uploads for product images and artisan profiles
- Reviews and ratings

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Environment Variables**

Create a `.env` file in the root directory and add the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/chikankari
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

3. **Run the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Artisans
- `POST /api/artisans` - Register a new artisan
- `POST /api/artisans/login` - Login artisan
- `GET /api/artisans` - Get all artisans
- `GET /api/artisans/:id` - Get artisan by ID
- `GET /api/artisans/profile` - Get artisan profile
- `PUT /api/artisans/profile` - Update artisan profile
- `POST /api/artisans/profile/image` - Upload artisan profile image
- `POST /api/artisans/profile/cover` - Upload artisan cover image
- `GET /api/artisans/admin/all` - Get all artisans (Admin only)
- `PUT /api/artisans/:id/approve` - Approve artisan (Admin only)
- `DELETE /api/artisans/:id` - Delete artisan (Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/artisan/:id` - Get artisan's products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a product (Artisan only)
- `PUT /api/products/:id` - Update product (Artisan/Admin only)
- `POST /api/products/:id/images` - Add product images (Artisan only)
- `POST /api/products/:id/reviews` - Create product review (Customer only)
- `DELETE /api/products/:id` - Delete product (Artisan/Admin only)

### Orders
- `POST /api/orders` - Create new order (Customer only)
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/myorders` - Get logged in user orders (Customer only)
- `GET /api/orders/artisan` - Get artisan orders (Artisan only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid (Customer only)
- `PUT /api/orders/:id/status` - Update order status (Artisan/Admin only)

## Directory Structure

```
server/
  ├── config/
  │   └── db.js
  ├── controllers/
  │   ├── artisanController.js
  │   ├── orderController.js
  │   ├── productController.js
  │   └── userController.js
  ├── middleware/
  │   ├── authMiddleware.js
  │   ├── errorMiddleware.js
  │   └── uploadMiddleware.js
  ├── models/
  │   ├── artisanModel.js
  │   ├── orderModel.js
  │   ├── productModel.js
  │   └── userModel.js
  ├── routes/
  │   ├── artisanRoutes.js
  │   ├── orderRoutes.js
  │   ├── productRoutes.js
  │   └── userRoutes.js
  ├── uploads/
  ├── .env
  ├── package.json
  └── server.js
```