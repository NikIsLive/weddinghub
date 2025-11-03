# WeddingHub - Wedding & Social Gathering Event Management System

A comprehensive full-stack application for managing Indian weddings and social gatherings, featuring vendor management, event planning, and booking functionalities.

## Features

### For Customers
- **User Onboarding**: Register and login to manage your events
- **Event Management**: Create and manage wedding and social gathering events
- **Vendor Browsing**: Browse vendors by category (Tent House, DJ, Catering, Confectioner, etc.)
- **Booking System**: Book vendors for your events
- **Event Tracking**: Track event status and bookings

### For Vendors
- **Vendor Onboarding**: Create vendor profiles with business details
- **Multiple Categories**: Support for 20+ vendor categories including:
  - Tent House
  - DJ
  - Catering
  - Confectioner
  - Photography & Videography
  - Decoration
  - Mehendi Artist
  - Makeup Artist
  - Bridal & Groom Wear
  - Jewelry
  - Florist
  - Transportation
  - Wedding Planner
  - Sound System
  - Generator
  - Lighting
  - Furniture
  - And more...
- **Booking Management**: Accept, update, and manage bookings
- **Rating System**: Receive ratings and reviews from customers

### Event Types
- **Wedding Events**: Complete wedding management with ceremony tracking
- **Social Gatherings**: Manage birthday parties, anniversaries, corporate events, festivals, etc.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- Modern CSS with responsive design

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weddinghub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `server/.env.example` to `server/.env`
   - Update the MongoDB URI and JWT secret

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the application**
   ```bash
   npm run dev
   ```
   This will start both the backend (port 5000) and frontend (port 3000) servers.

## Project Structure

```
weddinghub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
├── server/                # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Vendors
- `GET /api/vendors` - Get all vendors (with filters)
- `GET /api/vendors/categories` - Get all vendor categories
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor profile (authenticated)
- `PUT /api/vendors/:id` - Update vendor profile
- `DELETE /api/vendors/:id` - Delete vendor profile

### Events
- `GET /api/events` - Get user's events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Create Event**: Create a wedding or social gathering event
3. **Browse Vendors**: Search and filter vendors by category and location
4. **Book Vendors**: Book vendors for your event
5. **Manage Bookings**: Track and manage your bookings

## For Vendors

1. **Become a Vendor**: Click "Become a Vendor" and fill in your business details
2. **Manage Bookings**: Accept and manage booking requests
3. **Update Profile**: Keep your profile and pricing updated

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- API documentation available at `/api/health`

## License

ISC
