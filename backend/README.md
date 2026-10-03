# Sports Management Backend API

Backend API for The Champions Club Sports Management System built with Node.js, Express.js, Prisma, and PostgreSQL.

## 🚀 Features Implemented

### ✅ SP-B: Authentication System
- User signup (Super Admin + Club creation)
- User login with role verification
- JWT token-based authentication
- Password hashing with bcryptjs
- Secure cookie management
- Current user endpoint

### ✅ SP-C: Role-Based Access Control
- Six predefined roles with strict validation
- Role middleware for endpoint protection
- Role-to-module mapping enforcement
- Prevent role escalation attacks

### ✅ SP-D: Module Configuration
- Enable/disable six modules per club
- Module configuration APIs
- Impact warnings when disabling modules
- Super Admin-only module management

### ✅ SP-E: User Management
- Complete CRUD operations for users
- Role validation on user creation/update
- Module requirement validation
- Cannot delete last Super Admin
- Cannot delete self
- User statistics dashboard

### ✅ SP-F: Module-Based Authorization
- `checkModule` middleware
- Dynamic access control based on enabled modules
- Real-time module configuration changes
- Super Admin bypasses module checks

### 🗄️ Database Schema (Prisma)
- **Clubs** - Sports club/organization data
- **Users** - Staff members with role-based access
- **ModuleConfiguration** - Enable/disable modules per club
- **Role Enum** - 6 predefined roles

### 🔐 Security Features
- Helmet (security headers)
- CORS configuration
- Rate limiting on auth endpoints
- bcryptjs password hashing (configurable rounds)
- JWT token verification
- HttpOnly cookies
- Multi-tenant club isolation
- Input validation with Joi
- Comprehensive error handling

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── constants.js       # Roles, modules, error codes
│   │   ├── database.js        # Prisma client initialization
│   │   └── env.js             # Environment configuration
│   ├── controllers/
│   │   └── authController.js  # Auth request handlers
│   ├── middleware/
│   │   ├── authenticate.js    # JWT verification
│   │   ├── authorizeRole.js   # Role-based access control
│   │   └── checkModule.js     # Module-based authorization
│   ├── routes/
│   │   └── authRoutes.js      # Auth endpoints
│   ├── services/
│   │   └── authService.js     # Auth business logic
│   ├── utils/
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── jwt.js             # JWT utilities
│   │   ├── responseFormatter.js # Response formatting
│   │   └── validation.js      # Joi validation schemas
│   └── server.js              # Main application file
├── .env                       # Environment variables
├── .env.example               # Example environment file
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Update `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:gameHub123@10.80.212.48:5432/skyline_sportsclub?schema=public"
JWT_SECRET=your_jwt_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Setup

**Important:** Make sure the PostgreSQL server at `10.80.212.48:5432` is:
- ✅ Running and accessible
- ✅ Firewall allows connections
- ✅ Credentials are correct
- ✅ Database `skyline_sportsclub` exists (or Prisma can create it)

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Push Schema to Database
```bash
npx prisma db push
```

#### Or Create Migration
```bash
npx prisma migrate dev --name init
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create Super Admin + Club
- `POST /api/auth/login` - User login with role verification
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### User Management (Super Admin only)
- `GET /api/users` - Get all users (with filters)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Club & Module Management
- `GET /api/club/profile` - Get club information
- `PATCH /api/club/profile` - Update club (Super Admin only)
- `GET /api/club/modules` - Get module configuration
- `PATCH /api/club/modules` - Update modules (Super Admin only)
- `GET /api/club/stats` - Get club statistics

**📄 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.**

**📮 Import [postman_collection.json](./postman_collection.json) for API testing.**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "Marcus",
  "lastName": "Vance",
  "email": "marcus@skylinesports.com",
  "password": "password123",
  "confirmPassword": "password123",
  "clubName": "Skyline Sports Club",
  "clubAddress": "123 Sports Street, Mumbai",
  "clubEmail": "info@skylinesports.com",
  "clubPhone": "+91 98765 43210",
  "clubWebsite": "https://skylinesports.com",
  "sport": "Multi-Sport",
  "country": "India"
}
```

**Response (201):**
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
      "address": "123 Sports Street, Mumbai",
      "email": "info@skylinesports.com",
      "phone": "+91 98765 43210"
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

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "marcus@skylinesports.com",
  "password": "password123",
  "role": "SUPER_ADMIN"  // Optional - for verification
}
```

**Response (200):**
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

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 4. Logout
```http
POST /api/auth/logout
```

## 🎯 Roles

- **SUPER_ADMIN** - Full access to all modules
- **RECEPTIONIST** - Membership, Court Booking
- **SHOP_INVENTORY_MANAGER** - Shop
- **BAR_CAFETERIA_STAFF** - Bar
- **HR_MANAGER** - HR
- **ACCOUNTANT** - Accounting

## 🧩 Modules

- **MEMBERSHIP** - Member management
- **COURT_BOOKING** - Court reservations
- **SHOP** - Inventory & sales
- **BAR** - Cafe/Bar operations
- **HR** - Staff management
- **ACCOUNTING** - Finance & billing

## 🔧 Troubleshooting

### Database Connection Failed
```
Error: P1001: Can't reach database server at 10.80.212.48:5432
```

**Solutions:**
1. Check if PostgreSQL is running on the remote server
2. Verify firewall rules allow connections from your IP
3. Test connection using `psql`:
   ```bash
   psql -h 10.80.212.48 -p 5432 -U postgres -d skyline_sportsclub
   ```
4. Try adding SSL if required:
   ```env
   DATABASE_URL="postgresql://postgres:gameHub123@10.80.212.48:5432/skyline_sportsclub?schema=public&sslmode=require"
   ```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

## 📝 Implementation Status

- [x] **SP-A**: Analysis & Planning ✅
- [x] **SP-B**: Authentication System ✅
- [x] **SP-C**: Role-Based Access Control ✅
- [x] **SP-D**: Module Configuration ✅
- [x] **SP-E**: User Management (CRUD) ✅
- [x] **SP-F**: Module-Based Authorization ✅
- [ ] **SP-G**: Frontend Integration
- [ ] **SP-H**: Security & Testing

## 🔐 Security Notes

- Never commit `.env` file to version control
- Change `JWT_SECRET` in production
- Use strong passwords for database
- Enable HTTPS in production
- Regular security audits recommended

## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Joi** - Request validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for The Champions Club Sports Management System**
