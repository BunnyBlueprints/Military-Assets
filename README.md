# 🎖 ARMISTRACK - Military Asset Management System

A comprehensive military asset management system for tracking equipment, managing transfers, recording assignments, and maintaining accountability across multiple military bases.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Role-Based Access Control](#role-based-access-control)
- [Database](#database)
- [Deployment](#deployment)
- [Test Credentials](#test-credentials)

---

## 🎯 Project Overview

ARMISTRACK is a military-grade asset management system designed to:
- Track opening balances, closing balances, and net movements of critical military assets
- Record asset assignments and expenditures
- Facilitate secure asset transfers between bases
- Maintain complete audit trail for compliance and accountability
- Provide role-based access control for different personnel levels

---

## 🏗️ Architecture

```
ARMISTRACK/
├── backend/                 # Express.js REST API
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth, logging, RBAC
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── seed/               # Database seeding
│   └── server.js           # Main server file
│
└── frontend/               # React.js Web App
    ├── src/
    │   ├── api/            # API client
    │   ├── context/        # Auth context
    │   ├── pages/          # Main pages
    │   ├── components/     # Reusable components
    │   ├── constants/      # Constants & configs
    │   ├── styles/         # Styling
    │   └── App.js          # Root component
    └── public/             # Static assets
```

---

## ✨ Core Features

### 📊 Dashboard
- **Key Metrics Display**: Opening Balance, Closing Balance, Net Movement, Assigned, Expended
- **Advanced Filtering**: Date range, Base selection, Equipment type
- **Net Movement Modal**: Detailed breakdown of Purchases, Transfers In, Transfers Out (Bonus)

### 📦 Purchases Management
- Record new asset purchases
- View historical purchase records
- Filter by date, base, and equipment type
- Track supplier information

### 🔄 Asset Transfers
- Initiate transfers between military bases
- Track transfer status (In Transit, Completed, Cancelled)
- Maintain complete transfer history with timestamps
- Authorization tracking

### 🎯 Assignments & Expenditures
- Assign assets to personnel
- Log asset expenditures/usage
- Track assignment history
- Personnel accountability records

### 🔐 Role-Based Access Control
- **Admin**: Full system access, all operations
- **Base Commander**: Base-specific data, manage own assignments
- **Logistics Officer**: Create purchases, track transfers

### 📋 Audit Trail
- Complete logging of all transactions
- User accountability
- Timestamp tracking
- Action history for compliance

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB Atlas (NoSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Middleware**: Express middleware for CORS, logging, auth
- **Utilities**: bcryptjs (password hashing), express-validator

### Frontend
- **Framework**: React.js 19.2.4
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: Custom CSS with responsive design
- **Authentication**: JWT with localStorage

### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB
- **Collections**: Users, Purchases, Transfers, Assignments, OpeningBalances, AuditLogs

---

## 📁 Project Structure

### Backend Routes
```
POST   /api/auth/login         → User authentication
GET    /api/auth/me            → Current user info
GET    /api/dashboard          → Dashboard metrics
GET    /api/purchases          → Fetch purchases
POST   /api/purchases          → Create purchase
GET    /api/transfers          → Fetch transfers
POST   /api/transfers          → Create transfer
GET    /api/assignments        → Fetch assignments
POST   /api/assignments        → Create assignment
GET    /api/audit              → Fetch audit logs
```

### Frontend Pages
```
/                    → Login Screen
/dashboard           → Asset metrics & analytics
/purchases           → Purchase history & recording
/transfers           → Transfer tracking
/assignments         → Assignment & expenditure management
```

---

## 🚀 Backend Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. Navigate to backend directory:
```bash
cd armistrack/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with MongoDB Atlas credentials:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3001
```

4. Seed the database:
```bash
node seed/seed.js
```

5. Start the server:
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## 🎨 Frontend Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Navigate to frontend directory:
```bash
cd armistrack/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3001
```

4. Start the development server:
```bash
npm start
```

Frontend runs on `http://localhost:3001`

---

## ▶️ Running the Application

### Development Mode (Both Servers)

**Terminal 1 - Backend:**
```bash
cd armistrack/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd armistrack/frontend
npm start
```

Both should start automatically:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3001`

### Production Build

Frontend:
```bash
cd armistrack/frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📡 API Documentation

### Authentication
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "gen.reid",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Gen. Marcus Reid",
    "username": "gen.reid",
    "role": "admin",
    "base": null
  }
}
```

### Dashboard Metrics
```
GET /api/dashboard?base=Alpha%20Base&equipment=Rifles&startDate=2024-01-01&endDate=2024-12-31

Response:
{
  "success": true,
  "metrics": {
    "openingBalance": 200,
    "purchases": 50,
    "transferIn": 30,
    "transferOut": 10,
    "assigned": 25,
    "expended": 15,
    "closingBalance": 230
  }
}
```

### Create Purchase
```
POST /api/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-03-13",
  "base": "Alpha Base",
  "equipment": "Rifles",
  "quantity": 50,
  "supplier": "ArmsDepot Inc.",
  "notes": "Annual resupply"
}
```

### Create Transfer
```
POST /api/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-03-13",
  "fromBase": "Alpha Base",
  "toBase": "Bravo Base",
  "equipment": "Vehicles",
  "quantity": 5,
  "authorizedBy": "Gen. Marcus Reid"
}
```

### Create Assignment
```
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-03-13",
  "base": "Alpha Base",
  "equipment": "Rifles",
  "quantity": 20,
  "type": "assigned",
  "personnel": "3rd Infantry Unit"
}
```

---

## 🔐 Role-Based Access Control

### Admin
- ✅ View all bases and data
- ✅ Create purchases for any base
- ✅ Initiate transfers between bases
- ✅ Assign assets across bases
- ✅ Access audit logs
- ✅ View all assignments and expenditures

### Base Commander
- ✅ View data only for assigned base
- ✅ Create purchases for own base
- ✅ Initiate transfers from own base
- ✅ Assign assets for own base
- ✅ Log expenditures
- ✅ View base-specific audit logs

### Logistics Officer
- ✅ Create purchases
- ✅ Track transfers
- ✅ View purchase and transfer history
- ❌ Cannot assign assets
- ❌ Cannot create transfers
- ❌ Cannot view other bases

---

## 💾 Database

### Technology: MongoDB Atlas (Cloud NoSQL)

**Why MongoDB?**
- Flexible schema for asset data
- Scalable for future growth
- Built-in support for complex queries
- Easy aggregation for dashboard metrics
- Excellent for storing audit logs

**Collections:**

1. **users**
   - Name, username, password (hashed)
   - Role: admin, base_commander, logistics_officer
   - Base assignment
   - Active status

2. **purchases**
   - Date, quantity, equipment type
   - Base, supplier
   - Created by (user reference)
   - Timestamps

3. **transfers**
   - From/To base
   - Equipment, quantity
   - Status: In Transit, Completed, Cancelled
   - Authorization info
   - Timestamps

4. **assignments**
   - Date, quantity, equipment
   - Base, personnel
   - Type: assigned or expended
   - Created by (user reference)

5. **openingbalances**
   - Base, equipment, quantity
   - Period start date

6. **auditlogs**
   - Action: LOGIN, PURCHASE_CREATE, TRANSFER_CREATE, etc.
   - User info, timestamp
   - Transaction details
   - IP address, user agent

---

## 🌐 Deployment

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Option 2: Netlify
```bash
npm run build
# Deploy build/ folder to Netlify
```

#### Option 3: GitHub Pages
```bash
npm run build
# Deploy build/ folder to GitHub Pages
```

### Backend Deployment Options

#### Option 1: Heroku
```bash
heroku login
heroku create app-name
git push heroku main
```

#### Option 2: Railway
```bash
npm install -g railway
railway login
railway up
```

#### Option 3: AWS/Azure/DigitalOcean
- Use Node.js hosting
- Configure MongoDB Atlas (already in cloud)
- Set environment variables

---

## 👥 Test Credentials

| Username | Password | Role | Base |
|----------|----------|------|------|
| `gen.reid` | `admin123` | Admin | - |
| `col.chen` | `cmd123` | Base Commander | Alpha Base |
| `lt.okafor` | `cmd456` | Base Commander | Bravo Base |
| `sgt.volkov` | `log123` | Logistics Officer | Alpha Base |
| `cpl.torres` | `log456` | Logistics Officer | Charlie Base |

**Demo Link**: [View Live Project](#) *(To be deployed)*

---

## 📊 Key Metrics Calculation

**Opening Balance**: Starting inventory for the period

**Purchases**: New assets acquired

**Transfer In**: Assets received from other bases

**Transfer Out**: Assets sent to other bases

**Assigned**: Assets assigned to personnel

**Expended**: Assets used/consumed

**Closing Balance** = Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended

**Net Movement** = Purchases + Transfer In - Transfer Out

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=armistrack_secret_key_12345
CLIENT_URL=http://localhost:3001
JWT_EXPIRES_IN=8h
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3001
```

---

## 📝 Notes

- All passwords are securely hashed using bcryptjs
- JWT tokens expire after 8 hours
- Audit logs track all user actions
- Base-scoped access is enforced via middleware
- CORS is configured for frontend-backend communication
- MongoDB Atlas provides automatic backups

---

## 📞 Support & Maintenance

For issues or improvements:
1. Check the audit logs for transaction history
2. Verify user roles and permissions
3. Ensure MongoDB Atlas is accessible
4. Check API endpoints configuration

---

**Developed with ❤️ for Military Asset Management**
