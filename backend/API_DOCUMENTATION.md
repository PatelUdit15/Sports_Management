# API Documentation

Complete API reference for The Champions Club Sports Management System.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in requests:

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

**Or Cookie:**
```
Cookie: token=<your_jwt_token>
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [User Management](#user-management)
3. [Club & Module Management](#club--module-management)

---

## Authentication Endpoints

### 1. Signup (Create Super Admin + Club)

Create a new club with the first Super Admin user.

**Endpoint:** `POST /api/auth/signup`

**Access:** Public

**Request Body:**
```json
{
  "firstName": "Marcus",
  "lastName": "Vance",
  "email": "marcus@skylinesports.com",
  "password": "password123",
  "confirmPassword": "password123",
  "clubName": "Skyline Sports Club",
  "clubAddress": "123 Sports Street, Mumbai, India",
  "clubEmail": "info@skylinesports.com",
  "clubPhone": "+91 98765 43210",
  "clubWebsite": "https://skylinesports.com",
  "sport": "Multi-Sport",
  "country": "India"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Signup successful. Welcome to Champions Club!",
  "data": {
    "user": {
      "id": "USR-1234567890",
      "name": "Marcus Vance",
      "email": "marcus@skylinesports.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    },
    "club": {
      "id": "CLUB-1234567890",
      "name": "Skyline Sports Club",
      "address": "123 Sports Street, Mumbai, India",
      "email": "info@skylinesports.com",
      "phone": "+91 98765 43210",
      "website": "https://skylinesports.com",
      "sport": "Multi-Sport",
      "country": "India"
    },
    "enabledModules": [
      "MEMBERSHIP",
      "COURT_BOOKING",
      "SHOP",
      "BAR",
      "HR",
      "ACCOUNTING"
    ],
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "marcus@skylinesports.com",
  "password": "password123",
  "role": "SUPER_ADMIN"  // Optional - validates user's actual role
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "USR-1234567890",
      "name": "Marcus Vance",
      "email": "marcus@skylinesports.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    },
    "club": {
      "id": "CLUB-1234567890",
      "name": "Skyline Sports Club"
    },
    "enabledModules": [
      "MEMBERSHIP",
      "COURT_BOOKING",
      "SHOP",
      "BAR",
      "HR",
      "ACCOUNTING"
    ],
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

**Error Response (403) - Wrong Role:**
```json
{
  "success": false,
  "message": "Invalid role. Your account role is RECEPTIONIST",
  "error": "INVALID_ROLE"
}
```

---

### 3. Get Current User

Get authenticated user information.

**Endpoint:** `GET /api/auth/me`

**Access:** Protected (requires authentication)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "USR-1234567890",
      "name": "Marcus Vance",
      "email": "marcus@skylinesports.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    },
    "club": {
      "id": "CLUB-1234567890",
      "name": "Skyline Sports Club"
    },
    "enabledModules": [
      "MEMBERSHIP",
      "COURT_BOOKING",
      "SHOP",
      "BAR",
      "HR",
      "ACCOUNTING"
    ]
  }
}
```

---

### 4. Logout

Clear authentication session.

**Endpoint:** `POST /api/auth/logout`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## User Management

All user management endpoints require **SUPER_ADMIN** role.

### 1. Get All Users

Retrieve all users in the club with optional filters.

**Endpoint:** `GET /api/users`

**Access:** Protected (Super Admin only)

**Query Parameters:**
- `role` (optional) - Filter by role (e.g., `RECEPTIONIST`)
- `isActive` (optional) - Filter by status (`true` or `false`)
- `search` (optional) - Search by name or email

**Examples:**
```
GET /api/users
GET /api/users?role=RECEPTIONIST
GET /api/users?isActive=true
GET /api/users?search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "userId": "USR-1234567890",
        "name": "Marcus Vance",
        "email": "marcus@skylinesports.com",
        "role": "SUPER_ADMIN",
        "isActive": true,
        "createdAt": "2026-10-03T10:00:00.000Z",
        "updatedAt": "2026-10-03T10:00:00.000Z"
      },
      {
        "userId": "USR-1234567891",
        "name": "Sarah Johnson",
        "email": "sarah@skylinesports.com",
        "role": "RECEPTIONIST",
        "isActive": true,
        "createdAt": "2026-10-03T11:00:00.000Z",
        "updatedAt": "2026-10-03T11:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

### 2. Get User by ID

Retrieve a specific user.

**Endpoint:** `GET /api/users/:id`

**Access:** Protected (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "userId": "USR-1234567891",
      "name": "Sarah Johnson",
      "email": "sarah@skylinesports.com",
      "role": "RECEPTIONIST",
      "isActive": true,
      "createdAt": "2026-10-03T11:00:00.000Z",
      "updatedAt": "2026-10-03T11:00:00.000Z"
    }
  }
}
```

---

### 3. Create User

Create a new user in the club.

**Endpoint:** `POST /api/users`

**Access:** Protected (Super Admin only)

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@skylinesports.com",
  "password": "password123",
  "role": "RECEPTIONIST"
}
```

**Available Roles:**
- `SUPER_ADMIN`
- `RECEPTIONIST`
- `SHOP_INVENTORY_MANAGER`
- `BAR_CAFETERIA_STAFF`
- `HR_MANAGER`
- `ACCOUNTANT`

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "userId": "USR-1234567891",
      "name": "Sarah Johnson",
      "email": "sarah@skylinesports.com",
      "role": "RECEPTIONIST",
      "isActive": true,
      "createdAt": "2026-10-03T11:00:00.000Z",
      "updatedAt": "2026-10-03T11:00:00.000Z"
    }
  }
}
```

**Error Response (403) - Module Disabled:**
```json
{
  "success": false,
  "message": "Cannot assign RECEPTIONIST role. The MEMBERSHIP module is not enabled for your club.",
  "error": "MODULE_DISABLED"
}
```

**Error Response (409) - User Exists:**
```json
{
  "success": false,
  "message": "User with this email already exists in your club",
  "error": "USER_ALREADY_EXISTS"
}
```

---

### 4. Update User

Update an existing user.

**Endpoint:** `PATCH /api/users/:id`

**Access:** Protected (Super Admin only)

**Request Body (all fields optional):**
```json
{
  "name": "Sarah J. Johnson",
  "email": "sarah.johnson@skylinesports.com",
  "password": "newpassword123",
  "role": "SHOP_INVENTORY_MANAGER",
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "userId": "USR-1234567891",
      "name": "Sarah J. Johnson",
      "email": "sarah.johnson@skylinesports.com",
      "role": "SHOP_INVENTORY_MANAGER",
      "isActive": false,
      "createdAt": "2026-10-03T11:00:00.000Z",
      "updatedAt": "2026-10-03T12:30:00.000Z"
    }
  }
}
```

---

### 5. Delete User

Delete a user from the club.

**Endpoint:** `DELETE /api/users/:id`

**Access:** Protected (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (403) - Cannot Delete Self:**
```json
{
  "success": false,
  "message": "You cannot delete your own account",
  "error": "FORBIDDEN"
}
```

**Error Response (403) - Last Super Admin:**
```json
{
  "success": false,
  "message": "Cannot delete the last Super Admin. Please assign another Super Admin first.",
  "error": "FORBIDDEN"
}
```

---

### 6. Get User Statistics

Get user statistics for the club.

**Endpoint:** `GET /api/users/stats`

**Access:** Protected (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 10,
    "activeUsers": 9,
    "inactiveUsers": 1,
    "roleDistribution": [
      { "role": "SUPER_ADMIN", "count": 1 },
      { "role": "RECEPTIONIST", "count": 3 },
      { "role": "SHOP_INVENTORY_MANAGER", "count": 2 },
      { "role": "BAR_CAFETERIA_STAFF", "count": 2 },
      { "role": "HR_MANAGER", "count": 1 },
      { "role": "ACCOUNTANT", "count": 1 }
    ]
  }
}
```

---

## Club & Module Management

### 1. Get Club Profile

Get club information.

**Endpoint:** `GET /api/club/profile`

**Access:** Protected (all authenticated users)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Club profile retrieved successfully",
  "data": {
    "club": {
      "id": "CLUB-1234567890",
      "name": "Skyline Sports Club",
      "address": "123 Sports Street, Mumbai, India",
      "email": "info@skylinesports.com",
      "phone": "+91 98765 43210",
      "website": "https://skylinesports.com",
      "sport": "Multi-Sport",
      "country": "India",
      "isActive": true,
      "createdAt": "2026-10-03T10:00:00.000Z"
    }
  }
}
```

---

### 2. Update Club Profile

Update club information.

**Endpoint:** `PATCH /api/club/profile`

**Access:** Protected (Super Admin only)

**Request Body (all fields optional):**
```json
{
  "name": "Skyline Premier Sports Club",
  "address": "456 New Sports Avenue, Mumbai, India",
  "email": "contact@skylinesports.com",
  "phone": "+91 98765 00000",
  "website": "https://www.skylinesports.com",
  "sport": "Tennis",
  "country": "India"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Club profile updated successfully",
  "data": {
    "club": {
      "id": "CLUB-1234567890",
      "name": "Skyline Premier Sports Club",
      "address": "456 New Sports Avenue, Mumbai, India",
      "email": "contact@skylinesports.com",
      "phone": "+91 98765 00000",
      "website": "https://www.skylinesports.com",
      "sport": "Tennis",
      "country": "India"
    }
  }
}
```

---

### 3. Get Module Configuration

Get enabled/disabled modules for the club.

**Endpoint:** `GET /api/club/modules`

**Access:** Protected (all authenticated users)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Module configuration retrieved successfully",
  "data": {
    "modules": {
      "membership": true,
      "courtBooking": true,
      "shop": true,
      "bar": true,
      "hr": false,
      "accounting": true
    },
    "enabledModules": [
      "MEMBERSHIP",
      "COURT_BOOKING",
      "SHOP",
      "BAR",
      "ACCOUNTING"
    ]
  }
}
```

---

### 4. Update Module Configuration

Enable or disable modules for the club.

**Endpoint:** `PATCH /api/club/modules`

**Access:** Protected (Super Admin only)

**Request Body (all fields optional):**
```json
{
  "membership": true,
  "courtBooking": true,
  "shop": false,
  "bar": true,
  "hr": true,
  "accounting": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Module configuration updated successfully",
  "data": {
    "modules": {
      "membership": true,
      "courtBooking": true,
      "shop": false,
      "bar": true,
      "hr": true,
      "accounting": true
    },
    "enabledModules": [
      "MEMBERSHIP",
      "COURT_BOOKING",
      "BAR",
      "HR",
      "ACCOUNTING"
    ],
    "warnings": [
      {
        "module": "shop",
        "affectedRoles": ["SHOP_INVENTORY_MANAGER"],
        "affectedUserCount": 2,
        "message": "2 user(s) with role(s) SHOP_INVENTORY_MANAGER will lose access to their primary module."
      }
    ]
  }
}
```

---

### 5. Get Club Statistics

Get club-wide statistics.

**Endpoint:** `GET /api/club/stats`

**Access:** Protected (all authenticated users)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Club statistics retrieved successfully",
  "data": {
    "totalUsers": 10,
    "activeUsers": 9,
    "inactiveUsers": 1,
    "enabledModules": 5,
    "usersByRole": [
      { "role": "SUPER_ADMIN", "count": 1 },
      { "role": "RECEPTIONIST", "count": 3 },
      { "role": "SHOP_INVENTORY_MANAGER", "count": 2 },
      { "role": "BAR_CAFETERIA_STAFF", "count": 2 },
      { "role": "ACCOUNTANT", "count": 2 }
    ]
  }
}
```

---

## Error Responses

### Common Error Codes

- `INVALID_CREDENTIALS` - Wrong email/password
- `INVALID_ROLE` - Role doesn't match user's actual role
- `ROLE_NOT_ALLOWED` - User doesn't have permission
- `MODULE_DISABLED` - Required module is not enabled
- `INSUFFICIENT_PERMISSION` - User lacks required role
- `USER_ALREADY_EXISTS` - Email already in use
- `CLUB_NOT_FOUND` - Club doesn't exist
- `USER_NOT_FOUND` - User doesn't exist
- `INVALID_MODULE` - Invalid module name
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Action not allowed
- `VALIDATION_ERROR` - Invalid request data
- `SERVER_ERROR` - Internal server error

### Example Error Response

```json
{
  "success": false,
  "message": "Access denied. Required role: SUPER_ADMIN",
  "error": "INSUFFICIENT_PERMISSION"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

Authentication endpoints are rate-limited:
- **Window:** 15 minutes
- **Max requests:** 10 per IP

---

## Testing with cURL

### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marcus",
    "lastName": "Vance",
    "email": "marcus@skylinesports.com",
    "password": "password123",
    "confirmPassword": "password123",
    "clubName": "Skyline Sports Club",
    "clubAddress": "123 Sports Street, Mumbai",
    "clubEmail": "info@skylinesports.com",
    "clubPhone": "+91 98765 43210"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marcus@skylinesports.com",
    "password": "password123"
  }'
```

### 3. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@skylinesports.com",
    "password": "password123",
    "role": "RECEPTIONIST"
  }'
```

---

**Built with ❤️ for The Champions Club Sports Management System**
