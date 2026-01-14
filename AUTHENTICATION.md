# Authentication Testing Guide

## Role-Based Authentication Implementation

The application now has proper role-based authentication with the following features:

### Authentication Features

1. **Email + Password Login**
   - Login uses email instead of username
   - Passwords are verified using bcrypt hashing
   - API endpoint: POST `/api/auth/login`

2. **Role-Based Access Control**
   - **STAFF Role**: Access to Dashboard, Customers, Rides, Reservations, Challenge, Vouchers
   - **ADMIN Role**: All STAFF access + Payments and Settings

3. **Route Protection**
   - Unauthenticated users are redirected to `/login`
   - Users without proper role access are redirected to `/dashboard`
   - Protected routes automatically check user role

4. **UI Updates**
   - Sidebar shows only menu items allowed for the user's role
   - Topbar displays user name and role badge
   - Logout button clears session and redirects to login

### Testing Instructions

#### 1. Setup Database

First, ensure your PostgreSQL database is running and configured:

```bash
# Create database
createdb racegarage

# Update .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/racegarage?schema=public"

# Push schema and seed database
npm run db:push
npm run db:seed
```

#### 2. Test STAFF Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter credentials:
   - Email: `staff@local.test`
   - Password: `staff123!`
4. After login, you should see:
   - Dashboard page
   - Sidebar with: Dashboard, Customers, Rides, Reservations, Challenge, Vouchers
   - NO access to Payments or Settings
   - Topbar showing "Staff Member" and "STAFF" role badge

#### 3. Test ADMIN Login

1. Logout (click Logout button in topbar)
2. Login with ADMIN credentials:
   - Email: `admin@local.test`
   - Password: `admin123!`
3. After login, you should see:
   - Dashboard page
   - Sidebar with ALL menu items including Payments and Settings
   - Topbar showing "Administrator" and "ADMIN" role badge

#### 4. Test Route Protection

While logged in as STAFF:
1. Try to manually navigate to `/payments` or `/settings`
2. You should be automatically redirected to `/dashboard`

While logged in as ADMIN:
1. You can access all routes including `/payments` and `/settings`

#### 5. Test Invalid Credentials

1. Logout
2. Try to login with incorrect email or password
3. You should see an error message: "Invalid email or password"

### Architecture

**Login Flow:**
```
1. User submits email + password
2. Frontend calls POST /api/auth/login
3. API queries database for user by email
4. API verifies password using bcrypt.compare()
5. If valid, return user data (without password)
6. Frontend stores user in localStorage
7. AuthContext updates and redirects to /dashboard
```

**Route Protection:**
```
1. AuthContext checks if user is authenticated
2. If not, redirect to /login
3. If authenticated, check if user role has access to current route
4. If no access, redirect to /dashboard
5. Sidebar filters menu items based on user role
```

### Implementation Files

- `/src/app/api/auth/login/route.ts` - Authentication API endpoint
- `/src/contexts/AuthContext.tsx` - Authentication context with role checking
- `/src/app/login/page.tsx` - Login page with error handling
- `/src/components/Sidebar.tsx` - Role-based menu filtering
- `/src/components/Topbar.tsx` - User info display
- `/src/lib/prisma/client.ts` - Prisma client with PostgreSQL adapter

### Security Features

✅ Bcrypt password hashing
✅ Password never returned in API responses
✅ Role-based access control
✅ Route protection with automatic redirects
✅ Secure API endpoints
✅ Input validation
✅ Error handling without exposing sensitive info
✅ Type validation for localStorage data
✅ Timing attack prevention in password verification

⚠️ **Security Note**: Current implementation uses localStorage for user session storage. For production applications, consider:
- Using httpOnly cookies instead of localStorage to prevent XSS attacks
- Implementing JWT tokens with proper expiration
- Using secure session management libraries like NextAuth.js
- Implementing CSRF protection
- Using HTTPS/TLS for all communications

### Next Steps for Production

1. Replace localStorage with httpOnly cookies or JWT tokens
2. Add JWT tokens or session management
3. Implement HTTPS/TLS
4. Add rate limiting for login attempts
5. Add password reset functionality
6. Add two-factor authentication
7. Add audit logging for authentication events
8. Add CSRF protection
9. Consider using NextAuth.js for enterprise authentication
10. Implement session expiration and refresh tokens
