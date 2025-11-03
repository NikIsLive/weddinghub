# WeddingHub Setup Instructions

## Issue: "Server error during registration"

This error typically occurs when MongoDB is not running on your system.

## Solution

### Step 1: Install MongoDB (if not installed)

**Windows:**
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. MongoDB usually installs as a Windows service

**Or use MongoDB Atlas (Cloud - Recommended):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### Step 2: Start MongoDB

**Option A: MongoDB as Windows Service**
- MongoDB usually starts automatically as a Windows service
- Check services: Press `Win + R`, type `services.msc`, look for "MongoDB Server"

**Option B: Manual Start**
```bash
# Navigate to MongoDB bin directory (usually C:\Program Files\MongoDB\Server\{version}\bin)
mongod
```

**Option C: Use MongoDB Atlas (Cloud)**
- No installation needed
- Update `server/.env` with your Atlas connection string

### Step 3: Create Environment File

Create `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/weddinghub
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

**For MongoDB Atlas, use:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weddinghub
```

### Step 4: Verify MongoDB Connection

1. Check server console output - you should see:
   ```
   MongoDB Connected: localhost:27017
   ```

2. If you see connection errors, MongoDB is not running

### Step 5: Restart the Server

After starting MongoDB, restart your development server:
```bash
npm run dev
```

## Quick Check Commands

**Check if MongoDB is running (Windows):**
```powershell
Get-Service MongoDB
```

**Test MongoDB connection:**
```bash
mongosh
# or
mongo
```

## Alternative: Use MongoDB Atlas (Cloud Database)

1. Sign up at https://www.mongodb.com/cloud/atlas (free tier available)
2. Create a cluster
3. Get connection string
4. Update `server/.env` with the Atlas connection string
5. No local installation needed!

## Still Having Issues?

Check the server console logs - they will now show more detailed error messages about:
- MongoDB connection status
- Specific validation errors
- Database errors

The improved error handling will display specific messages like:
- "Database connection not available. Please ensure MongoDB is running."
- "Email already exists"
- Other specific validation errors

