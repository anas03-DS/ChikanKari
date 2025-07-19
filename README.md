# Chikankari Artisans - Direct From Artisan to Customer

A responsive website platform for Chikankari young artisans to sell their handcrafted products directly to customers, eliminating middlemen and ensuring they receive fair compensation for their work.

## Project Overview

Chikankari Artisans is a platform that connects talented young artisans practicing the traditional Chikankari embroidery craft with customers worldwide. The website features:

- Separate sections for customers and artisans
- Responsive design that works on all devices
- Product showcase with filtering capabilities
- Artisan profiles highlighting their work and skills
- Customer registration and login system
- Artisan registration, dashboard, and product management

## Project Structure

```
chikankari-project/
│
├── index.html              # Homepage
├── shop.html               # Shop page for customers
├── artisans.html           # Artisans showcase page
├── login.html              # Login page for both customers and artisans
├── artisan-register.html   # Registration page for artisans
├── dashboard.html          # Artisan dashboard for product management
│
├── css/
│   └── style.css           # Main stylesheet
│
├── js/
│   └── script.js           # JavaScript functionality
│
└── images/                 # Image assets
    └── placeholder.jpg     # Placeholder image
```

## Features

### For Customers
- Browse and search products by category, price, and artisan location
- View detailed artisan profiles and their work
- User account creation and management
- Product filtering and sorting options

### For Artisans
- Create an artisan profile with portfolio
- Add, edit, and manage products
- Track orders and earnings
- Dashboard with sales analytics
- Direct connection with customers

## How to Use

### For Local Development

1. Clone the repository to your local machine:
```
git clone https://github.com/yourusername/chikankari-project.git
```

2. Open the project folder in your code editor.

3. To preview the website, you can use any local development server. For example, with Node.js installed:
```
npx serve
```

4. Visit `http://localhost:3000` in your browser to view the website.

### For Customers

1. Visit the homepage to explore featured products and artisans
2. Navigate to the Shop page to browse all products
3. Use filters to find specific items by category, price, etc.
4. Create an account or login to place orders
5. Explore artisan profiles to learn more about the craftspeople

### For Artisans

1. Register as an artisan through the "Join as Artisan" page
2. Complete your profile with information about your work
3. Upload portfolio images of your Chikankari crafts
4. Once approved, login to access your dashboard
5. Add products, manage inventory, and track orders through the dashboard

## Technical Implementation

- HTML5 for structure
- CSS3 for styling with responsive design
- Vanilla JavaScript for interactivity
- Node.js and Express.js for backend API
- MongoDB for database
- JWT for authentication
- Multer for file uploads
- Mobile-first approach for responsive design

## Backend Implementation

The project includes a complete backend API built with Node.js, Express, and MongoDB. The backend provides:

- User authentication and authorization
- Artisan registration and approval system
- Product management with image uploads
- Order processing and tracking
- Reviews and ratings
- RESTful API endpoints

### Backend Structure

```
server/
  ├── config/           # Database configuration
  ├── controllers/      # Route controllers
  ├── middleware/       # Custom middleware
  ├── models/           # MongoDB models
  ├── routes/           # API routes
  ├── uploads/          # Uploaded files
  └── server.js         # Main server file
```

### Running the Backend

1. Navigate to the server directory:
```
cd server
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/chikankari
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

4. Run the development server:
```
npm run dev
```

For more details on the backend API, see the [server/README.md](server/README.md) file.

## Future Enhancements

- ~~Backend integration for user authentication and data storage~~ (Implemented)
- Payment gateway integration
- ~~Order tracking system~~ (Implemented)
- ~~Review and rating system~~ (Implemented)
- Direct messaging between customers and artisans
- Multi-language support for global reach

## Credits

- Font Awesome for icons
- Google Fonts for typography
- Placeholder images courtesy of [placeholder source]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or inquiries, please contact [your contact information].

---

© 2024 Chikankari Artisans. All rights reserved. 