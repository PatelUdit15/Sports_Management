# Frontend Integration Documentation

## 🎉 Frontend Integration Complete (SP-G)

This document details the frontend integration with the backend API for **The Champions Club Sports Management System**.

---

## ✅ Completed Features

### **1. API Service Layer**
- ✅ Axios instance with interceptors
- ✅ Automatic token injection
- ✅ Global error handling
- ✅ Network error handling
- ✅ Automatic redirect on 401 Unauthorized

### **2. Authentication Context**
- ✅ Global authentication state
- ✅ User data management
- ✅ Club data management
- ✅ Enabled modules tracking
- ✅ Login function
- ✅ Signup function
- ✅ Logout function
- ✅ Auto-refresh token validation
- ✅ localStorage persistence

### **3. Protected Routes**
- ✅ Route guard component
- ✅ Auto-redirect to login
- ✅ Loading state during auth check
- ✅ Wraps all dashboard routes

### **4. Updated Pages**
- ✅ Login page connected to API
- ✅ Signup page connected to onboarding
- ✅ Onboarding creates club + Super Admin
- ✅ Dynamic navigation based on modules
- ✅ User info in Sidebar/Topbar
- ✅ Logout functionality

### **5. Dynamic Features**
- ✅ Show/hide menu items based on enabled modules
- ✅ Display club name in UI
- ✅ Display user name and role
- ✅ User initials in avatar
- ✅ Module-based navigation filtering

---

## 📂 New Files Created

```
frontend/src/
├── context/
│   └── AuthContext.jsx         # Global auth state management
├── services/
│   ├── api.js                  # Axios instance configuration
│   ├── authService.js          # Authentication API calls
│   ├── userService.js          # User management API calls
│   └── clubService.js          # Club & module API calls
├── components/
│   └── ProtectedRoute.jsx      # Route guard component
└── .env                        # Environment variables
```

**Total:** 7 new files created

---

## 🔧 Modified Files

1. **package.json** - Added axios dependency
2. **App.jsx** - Added AuthProvider and ProtectedRoute
3. **Login.jsx** - Connected to auth API
4. **Signup.jsx** - Connected to onboarding flow
5. **Onboarding.jsx** - Connected to signup API
6. **Sidebar.jsx** - Dynamic navigation + user info + logout
7. **Topbar.jsx** - Dynamic club name + user avatar

**Total:** 7 files modified

---

## 🎯 How It Works

### **Authentication Flow**

```
1. User visits app
   ↓
2. AuthContext checks localStorage for token
   ↓
3. If token exists, validate with /api/auth/me
   ↓
4. Set isAuthenticated = true
   ↓
5. ProtectedRoute allows access
   ↓
6. Dashboard loads
```

### **Login Flow**

```
1. User enters email + password
   ↓
2. authService.login() called
   ↓
3. POST /api/auth/login
   ↓
4. Receive: { user, club, enabledModules, token }
   ↓
5. Store in localStorage + AuthContext
   ↓
6. Navigate to /dashboard
```

### **Signup + Onboarding Flow**

```
1. User fills signup form (Signup.jsx)
   ↓
2. Navigate to /onboarding with account data
   ↓
3. User fills club info + selects modules (Onboarding.jsx)
   ↓
4. authService.signup() called
   ↓
5. POST /api/auth/signup
   ↓
6. Club + Super Admin + Modules created
   ↓
7. Receive token + user data
   ↓
8. If modules different from default:
   → clubService.updateModules() called
   ↓
9. Navigate to /dashboard
```

### **Protected Route Flow**

```
User navigates to /dashboard
   ↓
ProtectedRoute component checks:
   ↓
Is loading? → Show spinner
   ↓
Is authenticated? → Show content
   ↓
Not authenticated? → Redirect to /login
```

### **Dynamic Navigation Flow**

```
Sidebar renders
   ↓
Get enabledModules from AuthContext
   ↓
Filter nav items:
   • /members → requires MEMBERSHIP
   • /court-bookings → requires COURT_BOOKING
   • /shop → requires SHOP
   • /cafe → requires BAR
   • /staff → requires HR
   • /finance → requires ACCOUNTING
   ↓
Render filtered navigation
```

---

## 🔐 Authentication State

### **Stored in localStorage:**
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "USR-1234567890",
    name: "Marcus Vance",
    email: "marcus@skylinesports.com",
    role: "SUPER_ADMIN",
    isActive: true
  },
  club: {
    id: "CLUB-1234567890",
    name: "Skyline Sports Club"
  },
  enabledModules: [
    "MEMBERSHIP",
    "COURT_BOOKING",
    "SHOP",
    "BAR",
    "HR",
    "ACCOUNTING"
  ]
}
```

### **Available in AuthContext:**
```javascript
const {
  user,              // Current user object
  club,              // Current club object
  enabledModules,    // Array of enabled module names
  loading,           // Auth initialization loading state
  isAuthenticated,   // Boolean auth status
  login,             // Login function
  signup,            // Signup function
  logout,            // Logout function
  hasModule,         // Check if module is enabled
  hasRole,           // Check if user has specific role
  isSuperAdmin,      // Check if user is Super Admin
} = useAuth();
```

---

## 🚀 Usage Examples

### **1. Using Authentication in Components**

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, club, isSuperAdmin, hasModule } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Club: {club.name}</p>
      
      {isSuperAdmin() && (
        <button>Admin Panel</button>
      )}
      
      {hasModule('SHOP') && (
        <Link to="/shop">Shop Management</Link>
      )}
    </div>
  );
}
```

### **2. Making API Calls**

```javascript
import { userService } from '../services/userService';

async function loadUsers() {
  try {
    const response = await userService.getAllUsers();
    if (response.success) {
      const users = response.data.users;
      // Use users...
    }
  } catch (error) {
    console.error('Failed to load users:', error.message);
  }
}
```

### **3. Protected Navigation**

```javascript
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { hasModule } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      {hasModule('MEMBERSHIP') && <Link to="/members">Members</Link>}
      {hasModule('SHOP') && <Link to="/shop">Shop</Link>}
      {hasModule('HR') && <Link to="/staff">Staff</Link>}
    </nav>
  );
}
```

---

## 🎨 Environment Variables

### **.env**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** Vite requires `VITE_` prefix for environment variables to be exposed to the browser.

---

## 🔄 API Service Methods

### **authService**
```javascript
authService.signup(signupData)           // Create Super Admin + Club
authService.login(loginData)             // Login user
authService.logout()                     // Logout
authService.getCurrentUser()             // Get current user
```

### **userService**
```javascript
userService.getAllUsers(filters)         // Get all users
userService.getUserById(userId)          // Get user by ID
userService.createUser(userData)         // Create user
userService.updateUser(userId, data)     // Update user
userService.deleteUser(userId)           // Delete user
userService.getUserStats()               // Get user statistics
```

### **clubService**
```javascript
clubService.getClubProfile()             // Get club info
clubService.updateClubProfile(data)      // Update club
clubService.getModules()                 // Get module config
clubService.updateModules(data)          // Update modules
clubService.getClubStats()               // Get club stats
```

---

## 🛡️ Error Handling

### **Automatic Error Handling**

The API client automatically handles:
- **401 Unauthorized** → Clear auth + redirect to login
- **Network errors** → Return friendly error message
- **Server errors** → Pass error to component

### **Manual Error Handling**

```javascript
try {
  const response = await authService.login(loginData);
  
  if (response.success) {
    // Success
  } else {
    // Handle error
    console.error(response.message);
  }
} catch (error) {
  // Handle exception
  console.error(error.message);
}
```

---

## 🎯 Module-Based Features

### **Modules Mapping**

| Module | Backend Key | Frontend Routes |
|--------|-------------|-----------------|
| MEMBERSHIP | `MEMBERSHIP` | `/members` |
| COURT_BOOKING | `COURT_BOOKING` | `/court-bookings` |
| SHOP | `SHOP` | `/shop` |
| BAR | `BAR` | `/cafe` |
| HR | `HR` | `/staff` |
| ACCOUNTING | `ACCOUNTING` | `/finance` |

### **Navigation Filtering**

The Sidebar automatically filters navigation based on enabled modules:

```javascript
const filteredNav = nav.map(group => ({
  ...group,
  items: group.items.filter(item => {
    if (item.to === '/members') return hasModule('MEMBERSHIP');
    if (item.to === '/shop') return hasModule('SHOP');
    // etc...
  })
}));
```

---

## 🧪 Testing

### **1. Test Signup Flow**
```bash
1. Navigate to http://localhost:5173/signup
2. Fill in account details
3. Click "Create Account & Set Up Club"
4. Fill in club details in onboarding
5. Select modules
6. Click "Launch Club"
7. Should redirect to /dashboard with user logged in
```

### **2. Test Login Flow**
```bash
1. Navigate to http://localhost:5173/login
2. Enter email and password
3. Click "Sign In to Dashboard"
4. Should redirect to /dashboard
5. Check sidebar shows user info
6. Check navigation shows only enabled modules
```

### **3. Test Protected Routes**
```bash
1. Clear localStorage
2. Navigate to http://localhost:5173/dashboard
3. Should redirect to /login
4. Login
5. Should redirect back to /dashboard
```

### **4. Test Logout**
```bash
1. Login to dashboard
2. Click "Logout" in sidebar
3. Should redirect to /login
4. localStorage should be cleared
5. Navigating to /dashboard should redirect to /login
```

### **5. Test Module Filtering**
```bash
1. Login as Super Admin
2. Note all navigation items visible
3. Go to Settings → Module Configuration
4. Disable HR module
5. Refresh page
6. "Staff & HR" should disappear from navigation
```

---

## 🐛 Known Issues & Limitations

### **1. Backend Not Running**
- Frontend will show network errors if backend is not running
- Ensure backend is running on `http://localhost:5000`

### **2. CORS Issues**
- Backend must have CORS enabled for `http://localhost:5173`
- Check backend `.env`: `CORS_ORIGIN=http://localhost:5173`

### **3. Token Expiration**
- Tokens expire after 7 days (configurable in backend)
- User must login again after expiration
- No refresh token mechanism yet

### **4. Module Configuration UI**
- Module configuration UI not yet implemented in Settings page
- Will be added in future update

---

## 📝 Next Steps

### **Remaining Tasks**

1. **Settings Page - Module Configuration**
   - Add UI to enable/disable modules
   - Show warnings for affected users
   - Super Admin only access

2. **User Management Page**
   - Convert Staff.jsx to user management UI
   - Create/edit/delete users
   - Role selection based on enabled modules
   - Show user statistics

3. **Role-Based UI Elements**
   - Hide/show buttons based on user role
   - "Create User" button only for Super Admin
   - Different dashboard views per role

4. **Error Boundaries**
   - Add React error boundaries
   - Graceful error handling
   - User-friendly error pages

5. **Loading States**
   - Add skeleton loaders
   - Better loading indicators
   - Optimistic UI updates

6. **Form Validation**
   - Client-side validation
   - Real-time error display
   - Better UX for forms

---

## 🔗 File Dependencies

```
App.jsx
  ├── AuthContext (wraps everything)
  └── ProtectedRoute
       └── DashboardLayout
            ├── Sidebar
            │    └── useAuth (user, club, logout, hasModule)
            └── Topbar
                 └── useAuth (user, club)

Login.jsx
  └── useAuth (login)

Signup.jsx
  └── Navigate to Onboarding

Onboarding.jsx
  └── useAuth (signup)
  └── clubService (updateModules)
```

---

## 🚀 Running the Application

### **1. Start Backend**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### **3. Test Complete Flow**
```bash
1. Open http://localhost:5173
2. Click "Create one free" (signup link)
3. Fill signup form
4. Complete onboarding
5. You'll be logged in to dashboard
```

---

## ✅ Implementation Checklist

- [x] Install axios
- [x] Create API service layer (api.js)
- [x] Create authService
- [x] Create userService
- [x] Create clubService
- [x] Create AuthContext
- [x] Create ProtectedRoute component
- [x] Update App.jsx with AuthProvider
- [x] Update Login.jsx with API integration
- [x] Update Signup.jsx to navigate to onboarding
- [x] Update Onboarding.jsx with API integration
- [x] Update Sidebar.jsx with dynamic navigation
- [x] Update Topbar.jsx with user info
- [x] Add logout functionality
- [x] Add loading states
- [x] Add error handling
- [x] Test authentication flow
- [ ] Add module configuration UI (Future)
- [ ] Add user management UI (Future)

---

## 📚 Resources

- [React Context API](https://react.dev/reference/react/useContext)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Frontend Integration Complete! ✅**

**Next Phase: User Management UI & Module Configuration UI**

---

**Built with ❤️ for The Champions Club Sports Management System**
