# Racegarage Simulator

A web-based race garage management system with role-based access control and user authentication.

## Features

- 🔐 User authentication with JWT tokens
- 👥 Three user roles with different permissions:
  - **Super Admin**: Full access (can see and delete everything)
  - **Admin**: Can see everything but cannot delete
  - **User**: Limited access (no finances view, no delete operations)
- 🏎️ Rides management
- 👤 Customer management
- 💰 Financial tracking (for Super Admin and Admin only)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will run on http://localhost:3000

## Default Users

### Super Admin
- Username: `superadmin`
- Password: `superadmin123`
- Permissions: Full access to all features including delete operations

### Admin
- Username: `admin`
- Password: `admin123`
- Permissions: View all features, create and update but cannot delete

### User
- Username: `user`
- Password: `user123`
- Permissions: Can manage rides and customers but cannot view finances or delete anything

## Technology Stack

- **Backend**: Node.js with Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: In-memory (for demo purposes)

## Security Notes

⚠️ **Important**: This is a demo application. For production use:
- Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
- Change the JWT secret in `.env` file
- Implement proper password reset functionality
- Add HTTPS support
- Implement rate limiting
- Add input validation and sanitization
- Set up proper session management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Rides
- `GET /api/rides` - Get all rides
- `POST /api/rides` - Create a new ride
- `PUT /api/rides/:id` - Update a ride
- `DELETE /api/rides/:id` - Delete a ride (Super Admin only)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer (Super Admin only)

### Finances
- `GET /api/finances` - Get all finances (Admin and Super Admin only)
- `POST /api/finances` - Create a new finance entry
- `PUT /api/finances/:id` - Update a finance entry
- `DELETE /api/finances/:id` - Delete a finance entry (Super Admin only)

## License

ISC
