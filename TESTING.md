# Race Garage Simulator - Testing Guide

## Overview
This document provides testing instructions for the race garage simulator application with role-based access control.

## Starting the Application

```bash
npm install
npm start
```

The server will start on `http://localhost:3000`

## Test Users

### 1. Super Admin
- **Username:** `superadmin`
- **Password:** `superadmin123`
- **Permissions:**
  - ✅ View all rides, customers, and finances
  - ✅ Create/Update all resources
  - ✅ Delete rides, customers, and finance entries

### 2. Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Permissions:**
  - ✅ View all rides, customers, and finances
  - ✅ Create/Update all resources
  - ❌ Cannot delete anything

### 3. Regular User
- **Username:** `user`
- **Password:** `user123`
- **Permissions:**
  - ✅ View rides and customers
  - ✅ Create/Update rides and customers
  - ❌ Cannot view finances tab
  - ❌ Cannot delete anything

## Manual Testing Steps

### Test Authentication
1. Open `http://localhost:3000` in browser
2. Try logging in with invalid credentials - should show error
3. Log in with each user role
4. Verify correct role badge is displayed
5. Test logout functionality

### Test Role-Based Access to Finances
1. Login as **user** (user/user123)
2. Verify "Financie" tab is NOT visible
3. Logout and login as **admin** (admin/admin123)
4. Verify "Financie" tab IS visible
5. Verify financial summary shows: Príjmy, Výdavky, Bilancia

### Test Delete Permissions
1. Login as **super admin**
2. Create a test ride
3. Verify "Odstrániť" (Delete) button is visible
4. Logout and login as **admin**
5. Verify delete button is NOT visible for admin
6. Logout and login as **user**
7. Verify delete button is NOT visible for user

### Test CRUD Operations

#### Rides (Jazdy)
1. Click "+ Pridať jazdu"
2. Fill in:
   - Meno zákazníka: "Test Customer"
   - Vozidlo: "Ferrari F1"
   - Dátum: Select today's date
   - Popis: "Test ride description"
3. Click "Uložiť"
4. Verify ride appears in list
5. Click "Upraviť" to edit
6. Modify and save
7. As super admin, click "Odstrániť" to delete

#### Customers (Zákazníci)
1. Switch to "Zákazníci" tab
2. Click "+ Pridať zákazníka"
3. Fill in customer details
4. Verify CRUD operations work

#### Finances (Financie)
1. Login as admin or super admin
2. Switch to "Financie" tab
3. Click "+ Pridať záznam"
4. Add income entry (Príjem)
5. Add expense entry (Výdavok)
6. Verify summary updates correctly

## API Testing

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}'

# Get current user
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Rides Access
```bash
# Get all rides (requires authentication)
curl http://localhost:3000/api/rides \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create ride
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"customerName":"John Doe","vehicleName":"Ferrari","date":"2026-02-15","description":"Test"}'
```

### Test Finance Access Control
```bash
# As regular user (should fail with 403)
USER_TOKEN="..." # Get from user login
curl http://localhost:3000/api/finances \
  -H "Authorization: Bearer $USER_TOKEN"

# As admin (should succeed)
ADMIN_TOKEN="..." # Get from admin login
curl http://localhost:3000/api/finances \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test Delete Permissions
```bash
# As admin (should fail with 403)
curl -X DELETE http://localhost:3000/api/rides/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# As super admin (should succeed)
SUPER_TOKEN="..." # Get from super admin login
curl -X DELETE http://localhost:3000/api/rides/1 \
  -H "Authorization: Bearer $SUPER_TOKEN"
```

## Expected Behaviors

### UI Behaviors
- ✅ Login page shows demo credentials
- ✅ Invalid login shows error message
- ✅ Successful login shows dashboard
- ✅ User role badge displays correctly
- ✅ Finances tab hidden for regular users
- ✅ Delete buttons hidden for non-super-admins
- ✅ All text in Slovak language
- ✅ Responsive design works on mobile

### API Behaviors
- ✅ Unauthenticated requests return 401
- ✅ Invalid tokens return 403
- ✅ Regular users get 403 on finance endpoints
- ✅ Non-super-admins get 403 on delete endpoints
- ✅ All endpoints validate required fields
- ✅ CORS enabled for cross-origin requests

## Security Validations

### Authentication
- ✅ Passwords are hashed with bcryptjs
- ✅ JWT tokens expire after 24 hours
- ✅ Tokens required for all protected endpoints

### Authorization
- ✅ Role checked on every protected endpoint
- ✅ Separate middleware for delete operations
- ✅ Finance endpoints restricted to admin/super_admin

### Environment
- ✅ JWT_SECRET required to start server
- ✅ Sensitive data in .env file
- ✅ .env excluded from git via .gitignore
