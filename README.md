# Ethio-Home Real Estate Platform

A comprehensive real estate platform built for the Ethiopian market, featuring property listings, user management, and secure transactions.

## 🚀 Features

- **Property Management**: List, view, and manage real estate properties
- **User Authentication**: Secure login/signup with role-based access
- **Multi-language Support**: English and Amharic support
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live property updates and notifications
- **Admin Dashboard**: Comprehensive admin panel for property and user management
- **Payment Integration**: Secure payment processing with Chapa
- **Email Notifications**: Automated email system for user communications

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **CSS3** - Custom styling with modern features

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email functionality
- **Bcryptjs** - Password hashing
- **Helmet** - Security middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ethio-home-final-layout-fix
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Environment Configuration

#### Backend Environment
Create/update `backend/config.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=20d
JWT_COOKIE_EXPIRES_IN=10

# Email Configuration (Gmail)
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Payment Configuration (Chapa)
CHAPA_API_KEY=your_chapa_api_key
FRONTEND_SUCCESS_URL=http://localhost:3000/success
FRONTEND_FAILURE_URL=http://localhost:3000/failure
FRONTEND_CALLBACK_URL=http://localhost:3000/callback
```

### 4. Start Development Servers

#### Option 1: Start Both Servers Together
```bash
npm run start:full
```

#### Option 2: Start Servers Separately

**Backend Server:**
```bash
npm run start:backend
# or
cd backend && npm run start:dev
```

**Frontend Server:**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
ethio-home-final-layout-fix/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── config/            # Configuration files
│   ├── styles/            # CSS stylesheets
│   └── assets/            # Static assets
├── backend/               # Backend source code
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── uploads/          # File uploads
├── public/               # Public static files
└── package.json          # Frontend dependencies
```

## 🔧 API Integration

The frontend is now fully integrated with the backend API. All data comes from the backend instead of mock data:

### Key API Services

- **`src/services/authService.js`** - Authentication (login, signup, logout)
- **`src/services/propertyService.js`** - Property management
- **`src/services/userService.js`** - User profile management
- **`src/services/reviewService.js`** - Review and testimonial management
- **`src/services/interestService.js`** - Property interest management

### API Endpoints

- **Properties**: `/api/v1/properties`
- **Users**: `/api/v1/users`
- **Reviews**: `/api/v1/reviews`
- **Interest**: `/api/v1/interest`
- **Selling**: `/api/v1/selling`
- **Subscription**: `/api/v1/subscription`

## 👥 User Roles

- **Buyer**: Browse properties, express interest, leave reviews
- **Seller**: List properties, manage listings
- **Agent**: Professional property management
- **Employee**: Support and moderation
- **Admin**: Full system administration

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can:

- Sign up with email verification
- Login with email/password
- Reset password via email
- Update profile information
- Manage account settings

## 🏠 Property Features

- **Property Types**: Houses, Apartments, Villas, Commercial
- **Status**: For Sale, For Rent
- **Features**: Bedrooms, Bathrooms, Area, Parking, etc.
- **Images**: Multiple property images
- **Location**: Detailed location information
- **Verification**: Admin-verified properties

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Multi-language**: English and Amharic support
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Search & Filter**: Advanced property search
- **Favorites**: Save favorite properties

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
```

### Backend Deployment
Ensure environment variables are set correctly for production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Recent Updates

- ✅ **API Integration Complete**: All mock data replaced with real API calls
- ✅ **Authentication Service**: Full JWT-based authentication
- ✅ **Property Management**: Complete CRUD operations
- ✅ **User Management**: Profile updates and role-based access
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Loading States**: Proper loading indicators throughout the app

---

**Built with ❤️ for the Ethiopian real estate market**

