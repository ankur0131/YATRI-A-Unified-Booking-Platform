# YATRI - Travel Booking Application

YATRI is a full-stack web application for travel booking and management. It allows users to register, log in, create bookings, and view their booking history. The application is built with a React frontend and a Node.js/Express backend using MongoDB for data storage.

## Features

- User authentication (registration and login)
- Secure JWT-based authentication
- Booking creation and management
- User dashboard for viewing personal bookings
- Responsive React frontend
- RESTful API backend

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Project Structure

```
YATRI/
├── middleware/          # Authentication middleware
├── server/             # Backend server
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── index.js        # Server entry point
├── yatri-frontend/     # React frontend
│   ├── public/         # Static assets
│   ├── src/            # React source code
│   └── build/          # Production build
├── package.json        # Root dependencies
└── README.md           # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd YATRI
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Set up the backend:**
   ```bash
   cd server
   npm install
   ```

4. **Set up the frontend:**
   ```bash
   cd ../yatri-frontend
   npm install
   ```

## Configuration

1. **Database Setup:**
   - Ensure MongoDB is running locally or set up a cloud MongoDB instance
   - Create a `.env` file in the `server/` directory with:
     ```
     MONGO_URI=mongodb://localhost:27017/yatri
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```

2. **Environment Variables:**
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `PORT`: Server port (default: 5000)

## Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend:**
   ```bash
   cd ../yatri-frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Bookings
- `GET /api/bookings` - Get user's bookings (authenticated)
- `POST /api/bookings` - Create a new booking (authenticated)

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or log in with existing credentials
3. Create bookings through the booking form
4. View your bookings on the "My Bookings" page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
