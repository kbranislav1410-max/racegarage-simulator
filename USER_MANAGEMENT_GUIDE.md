# User Management - Quick Start Guide

## Functionality Overview

Super admins can now create, edit, and delete application users through a new user management interface.

## Quick Access

1. **Login as SUPER_ADMIN**
2. **Click "Používatelia" in sidebar** (Users menu item)
3. **Start managing users!**

## Features

### ✅ Create Users
- Click "Nový používateľ" button
- Fill in: Email, Name, Password, Role
- Click "Vytvoriť"

### ✅ Edit Users
- Click pencil icon next to user
- Modify details (leave password empty to keep existing)
- Click "Uložiť"

### ✅ Delete Users
- Click trash icon next to user
- Confirm deletion
- User is permanently removed

### ✅ View Users
- See all users in a table
- Email, name, role, and creation date displayed
- Color-coded role badges

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **SUPER_ADMIN** | Full access | Can manage users, delete records, view financials, access settings |
| **ADMIN** | Management access | Can view financials and settings, but cannot manage users or delete records |
| **USER** | Basic access | Can add/edit records, no financial or settings access |

## Security Features

- ✅ Only SUPER_ADMIN can access user management
- ✅ Passwords are automatically hashed (bcrypt)
- ✅ Email uniqueness validation
- ✅ Cannot delete own account
- ✅ Cannot change own role
- ✅ Confirmation required for deletions

## API Endpoints

All endpoints require SUPER_ADMIN authorization:

```
GET    /api/users       - List all users
POST   /api/users       - Create new user
PUT    /api/users/{id}  - Update user
DELETE /api/users/{id}  - Delete user
```

## UI Components

### Navigation
- **Menu Item**: "Používatelia" (Users)
- **Icon**: UserCog icon
- **Visibility**: SUPER_ADMIN only

### User List
- **Table**: Shows all users with details
- **Actions**: Edit (pencil) and Delete (trash) buttons
- **Badges**: Color-coded role badges
  - SUPER_ADMIN: Red (#c20003)
  - ADMIN: Orange (#f59e0b)
  - USER: Gray (#6b7280)

### Create/Edit Modal
- **Form Fields**: Email, Name, Password, Role
- **Validation**: Real-time error messages
- **Actions**: Save or Cancel
- **Style**: Consistent with app theme (dark mode)

## Testing Checklist

- [ ] Login as SUPER_ADMIN
- [ ] Navigate to Users page
- [ ] Create new USER
- [ ] Create new ADMIN
- [ ] Edit user details
- [ ] Change user password
- [ ] Change user role
- [ ] Try to delete own account (should fail)
- [ ] Delete a user
- [ ] Login as ADMIN (should not see Users menu)
- [ ] Login as USER (should not see Users menu)

## Implementation Details

### Files Created
- `src/app/api/users/route.ts` - List and create users API
- `src/app/api/users/[id]/route.ts` - Update and delete users API
- `src/app/users/page.tsx` - User management UI

### Files Modified
- `src/lib/permissions.ts` - Added `canManageUsers()` function
- `src/lib/auth-helpers.ts` - Added `getUserFromRequest` alias
- `src/contexts/AuthContext.tsx` - Added `/users` route
- `src/components/Sidebar.tsx` - Added Users menu item

### Dependencies
- bcryptjs - Password hashing
- lucide-react - Icons (UserCog, Plus, Pencil, Trash2, X)
- Next.js 14+ - App router and API routes
- Prisma - Database ORM

## Technical Notes

### Password Hashing
```typescript
// Password is hashed with bcrypt (10 salt rounds)
const hashedPassword = await bcrypt.hash(password, 10);
```

### Authorization Check
```typescript
// Every API endpoint checks for SUPER_ADMIN role
const currentUser = await getUserFromRequest(request);
if (!currentUser || !canManageUsers(currentUser.role)) {
  return NextResponse.json(
    { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
    { status: 403 }
  );
}
```

### Database Schema
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  USER
}
```

## Best Practices

1. **Create SUPER_ADMIN carefully** - They have full access
2. **Use strong passwords** - Especially for SUPER_ADMIN accounts
3. **Regular audits** - Review user list periodically
4. **Principle of least privilege** - Give users minimum required role
5. **Document changes** - Keep track of who has access

## Common Issues & Solutions

### Issue: Cannot see Users menu
**Solution**: Make sure you're logged in as SUPER_ADMIN

### Issue: Email already in use
**Solution**: Use a different email or edit the existing user

### Issue: Cannot delete user
**Solution**: Check if you're trying to delete your own account (not allowed)

### Issue: API returns 403 Forbidden
**Solution**: Verify you're logged in as SUPER_ADMIN

## Next Steps

1. Test the functionality with different roles
2. Create your first users
3. Assign appropriate roles
4. Train team members on user management

## Support

For issues or questions:
1. Check SPRAVA_POUZIVATELOV.md for detailed documentation
2. Review API endpoint logs for errors
3. Contact development team if needed

---

**Feature Status**: ✅ Complete and Ready for Production

**Created**: 2026-02-04  
**Version**: 1.0
