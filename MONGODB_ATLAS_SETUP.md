# MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (it's free!)
3. Verify your email

### Step 2: Create a Free Cluster
1. After logging in, you'll see "Create a Deployment"
2. Choose the **FREE (M0)** tier
3. Select a cloud provider (AWS, Google Cloud, or Azure) - doesn't matter which
4. Choose a region closest to you (e.g., `N. Virginia (us-east-1)`)
5. Click **"Create Deployment"**
6. This takes about 3-5 minutes

### Step 3: Create Database User
1. While cluster is creating, you'll be asked to create a database user
2. Username: Create one (e.g., `weddinghub` or your name)
3. Password: Create a strong password (save it!)
4. Click **"Create Database User"**

### Step 4: Configure Network Access
1. You'll see "Where would you like to connect from?"
2. Click **"Add My Current IP Address"** (for development)
3. Or click **"Allow Access from Anywhere"** (0.0.0.0/0) - less secure but works everywhere
4. Click **"Finish and Close"**

### Step 5: Get Connection String
1. Once cluster is ready, click **"Connect"** button
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Copy this string** and replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - Add database name at the end: `...mongodb.net/weddinghub?retryWrites=true&w=majority`

### Step 6: Update .env File
Once you have your connection string, I'll help you update the .env file!

## Example Connection String Format
```
mongodb+srv://weddinghub:YourPassword123@cluster0.abc123.mongodb.net/weddinghub?retryWrites=true&w=majority
```

## Security Note
- Never commit your .env file to Git (it's already in .gitignore)
- Keep your password secure
- For production, use environment-specific variables

## Need Help?
If you get stuck at any step, let me know and I'll help you!

