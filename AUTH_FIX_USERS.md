# Authentication Fix for Users Management

## Problem

User reported that when logged in as SUPER_ADMIN and accessing the Users management page (`/users`):

1. **"Failed to fetch users"** - Error when loading the users list
2. **"Unauthorized - Only SUPER_ADMIN can manage users"** - Error when trying to create a new user

Even though they were authenticated as SUPER_ADMIN, the API endpoints were rejecting the requests.

## Root Cause

The users management page (`src/app/users/page.tsx`) was using the native `fetch()` function directly to make API calls:

```typescript
// BEFORE (BROKEN)
const response = await fetch("/api/users");
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});
```

This approach **did not include the Authorization header** that the API endpoints require to identify the authenticated user.

## Solution

Updated the users page to use the authenticated API client (`src/lib/api-client.ts`):

```typescript
// AFTER (FIXED)
import { api } from "@/lib/api-client";

const response = await api.get("/api/users");
const response = await api.post("/api/users", formData);
const response = await api.put(`/api/users/${id}`, updateData);
const response = await api.delete(`/api/users/${id}`);
```

The `api` client automatically:
1. Gets the user data from localStorage
2. Encodes it as base64
3. Adds it to the Authorization header
4. Sends it with every request

## How Authentication Works

### 1. User Login
When user logs in via `/api/auth/login`:
- User credentials are validated
- User data is returned
- Frontend stores user in localStorage
- AuthContext provides user to entire app

### 2. Making Authenticated Requests

**Using the API client (CORRECT):**
```typescript
import { api } from "@/lib/api-client";

// The api client automatically adds the Authorization header
const response = await api.get("/api/users");
```

**What happens internally:**
```typescript
// 1. Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));

// 2. Encode as base64
const token = Buffer.from(JSON.stringify(user)).toString("base64");

// 3. Add to headers
headers["Authorization"] = `Bearer ${token}`;

// 4. Make request with auth header
fetch(url, { headers });
```

### 3. API Route Authentication

```typescript
// API routes decode and validate the header
export async function GET(request: NextRequest) {
  const currentUser = getUserFromRequest(request);
  
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json(
      { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
      { status: 403 }
    );
  }
  
  // User is authenticated as SUPER_ADMIN, proceed...
}
```

## Changes Made

### Files Modified:

**1. src/app/users/page.tsx**
- Added import: `import { api } from "@/lib/api-client";`
- Replaced all `fetch()` calls with `api.*()` methods
- Now sends Authorization header automatically

**2. src/app/api/users/route.ts**
- Removed unnecessary `await` from `getUserFromRequest(request)`
- Function is synchronous, doesn't need await

**3. src/app/api/users/[id]/route.ts**
- Removed unnecessary `await` from `getUserFromRequest(request)`
- Function is synchronous, doesn't need await

### Before/After Comparison:

**BEFORE (Broken):**
```typescript
// Users page - No auth header sent
const fetchUsers = async () => {
  const response = await fetch("/api/users");
  // ...
};

const handleSubmit = async () => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  // ...
};
```

**AFTER (Fixed):**
```typescript
// Users page - Auth header automatically included
import { api } from "@/lib/api-client";

const fetchUsers = async () => {
  const response = await api.get("/api/users");
  // Authorization: Bearer {base64-user-data} automatically added
};

const handleSubmit = async () => {
  const response = await api.post("/api/users", formData);
  // Authorization header automatically added
};
```

## Verification

After the fix, the following should work:

1. **Fetch Users**
   - SUPER_ADMIN can view list of all users
   - API receives and validates Authorization header
   - Users list loads successfully

2. **Create User**
   - SUPER_ADMIN can create new users
   - Authorization header is sent
   - API validates SUPER_ADMIN role
   - User is created successfully

3. **Update User**
   - SUPER_ADMIN can edit existing users
   - Authorization works correctly
   - Updates are saved

4. **Delete User**
   - SUPER_ADMIN can delete users
   - Authorization validates
   - Deletion succeeds

## Testing Checklist

- [ ] Login as SUPER_ADMIN
- [ ] Go to Users page (/users)
- [ ] Verify users list loads (no "Failed to fetch" error)
- [ ] Click "Add User" button
- [ ] Fill in user details
- [ ] Submit form
- [ ] Verify no "Unauthorized" error
- [ ] Verify new user appears in list
- [ ] Edit a user
- [ ] Verify update works
- [ ] Delete a user (not yourself)
- [ ] Verify deletion works

## Important Notes

### Always Use API Client for Authenticated Requests

**DO THIS:**
```typescript
import { api } from "@/lib/api-client";

const response = await api.get("/api/endpoint");
const response = await api.post("/api/endpoint", data);
const response = await api.put("/api/endpoint", data);
const response = await api.delete("/api/endpoint");
```

**DON'T DO THIS:**
```typescript
// ❌ Missing Authorization header
const response = await fetch("/api/endpoint");
```

### When to Use Native fetch()

Only use native `fetch()` for:
- Public endpoints that don't require authentication
- External APIs outside your app
- Server-side code where auth is handled differently

### API Client Features

The `api` client from `api-client.ts` provides:
- Automatic Authorization header injection
- User data from localStorage
- Base64 encoding of user data
- Consistent error handling
- Type-safe methods (get, post, put, delete)

## Related Files

- `src/lib/api-client.ts` - Authenticated API client
- `src/lib/auth-helpers.ts` - Server-side auth utilities
- `src/contexts/AuthContext.tsx` - Client-side auth context
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/users/page.tsx` - Users management page

## Summary

The issue was that the users page was not sending the Authorization header with API requests. This was fixed by using the authenticated API client (`api-client.ts`) which automatically includes the user's authentication data with every request. All frontend API calls that require authentication should use this client to ensure proper authorization.
