# 🚀 Deploy Server to Render.com (Step-by-Step)

## Why Render.com?
- ✅ **100% FREE** (no credit card needed)
- ✅ Super easy setup (5 minutes)
- ✅ Supports WebSocket (Socket.io works!)
- ✅ Auto-deploys from GitHub
- ✅ Free SSL certificate (https://)
- ✅ Great for beginners

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Server Code

First, update your `package.json`:

**File: `server/package.json`**

Add/update these scripts:
```json
{
  "scripts": {
    "start": "node --loader ts-node/esm src/index.ts",
    "dev": "nodemon --exec node --loader ts-node/esm src/index.ts",
    "build": "tsc"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Step 2: Create GitHub Repository

1. **Create `.gitignore` in server folder:**
```
node_modules/
.env
*.log
dist/
.DS_Store
```

2. **Initialize Git and Push:**

Open PowerShell in your server folder:

```powershell
cd "d:\Games\Endless Runner\server"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial server commit"

# Create repo on GitHub (go to github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/anonchat-server.git

# Push
git branch -M main
git push -u origin main
```

**Don't have GitHub?**
- Go to: https://github.com/signup
- Create account (free)
- Create new repository: https://github.com/new
  - Name: `anonchat-server`
  - Public or Private (your choice)
  - Don't add README/gitignore

---

### Step 3: Deploy on Render

1. **Go to Render.com:**
   - Visit: https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub (easiest)

2. **Create New Web Service:**
   - Click "New +" button (top right)
   - Select "Web Service"

3. **Connect Repository:**
   - Grant Render access to your repos
   - Select `anonchat-server` repository

4. **Configure Service:**
   ```
   Name: anonchat-server
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave empty)
   
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   
   Instance Type: Free
   ```

5. **Advanced Settings (Optional):**
   - Environment Variables: None needed for now
   - Auto-Deploy: Yes (recommended)

6. **Create Web Service:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment

---

### Step 4: Get Your Server URL

After deployment completes:
- URL will be like: `https://anonchat-server.onrender.com`
- Copy this URL!

Test it:
- Open browser: `https://anonchat-server.onrender.com/health`
- Should show: `{"status":"ok","ts":...}`

---

### Step 5: Update Your Client App

**File: `client/services/socket.ts`**

Find this line:
```typescript
const SOCKET_URL = 'http://10.92.23.113:3001';
```

Change to:
```typescript
const SOCKET_URL = 'https://anonchat-server.onrender.com';
```

**Important:** 
- Use `https://` (not `http://`)
- Remove the port `:3001`
- Use your actual Render URL

---

### Step 6: Rebuild Your APK

```powershell
cd "d:\Games\Endless Runner\client"
eas build -p android --profile preview
```

Wait 15-20 minutes, download new APK, and you're done!

---

## 🎯 Complete Commands Reference

```powershell
# 1. Prepare server
cd "d:\Games\Endless Runner\server"

# 2. Create .gitignore
echo "node_modules/
.env
*.log" > .gitignore

# 3. Git setup
git init
git add .
git commit -m "Initial commit"

# 4. Push to GitHub (after creating repo)
git remote add origin https://github.com/YOUR_USERNAME/anonchat-server.git
git push -u origin main

# 5. Deploy on Render.com (via website)

# 6. Update client
cd "../client"
# Edit services/socket.ts with new URL

# 7. Rebuild APK
eas build -p android --profile preview
```

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render.com Free Plan:**
- ✅ 750 hours/month (plenty!)
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Takes ~30 seconds to wake up on first request
- ✅ Automatic SSL certificate
- ✅ WebSocket support

**What "spins down" means:**
- After 15 min of no activity, server sleeps
- First connection takes 30 sec to wake up
- After that, works normally
- Totally fine for testing and small apps!

---

## 🔄 Keep Server Awake (Optional)

To prevent spin-down, you can ping your server every 10 minutes.

### Option 1: Use Cron-job.org (Free)
1. Go to: https://cron-job.org
2. Create account
3. Create job:
   - URL: `https://anonchat-server.onrender.com/health`
   - Interval: Every 10 minutes

### Option 2: UptimeRobot (Free)
1. Go to: https://uptimerobot.com
2. Add monitor
3. URL: Your server URL
4. Interval: 5 minutes

---

## 🐛 Troubleshooting

### "Build Failed" on Render
- Check logs in Render dashboard
- Verify `package.json` has correct scripts
- Ensure all dependencies in `package.json`

### "Service Unavailable"
- Server is sleeping (free tier)
- Wait 30 seconds and try again
- Use UptimeRobot to keep it awake

### Can't Connect from App
- Verify URL is correct (https://, no port)
- Check server logs in Render dashboard
- Test `/health` endpoint in browser

### TypeScript Errors
Your server should build fine, but if issues:
```json
"start": "node --loader ts-node/esm src/index.ts"
```

---

## 📊 Monitor Your Deployment

### Render Dashboard
- View logs: Real-time server logs
- Metrics: CPU, memory usage
- Deploys: Deployment history
- Environment: Variables

### Check Server Status
```bash
# Health check
curl https://anonchat-server.onrender.com/health

# Should return:
# {"status":"ok","ts":1234567890}
```

---

## 🎉 You're Live!

Your server is now accessible worldwide at:
```
https://anonchat-server.onrender.com
```

Anyone with your APK can now:
- ✅ Connect from anywhere
- ✅ Chat in real-time
- ✅ Use all features
- ✅ No WiFi restrictions!

---

## 📝 Next Steps

1. ✅ Server deployed on Render
2. ✅ Updated SOCKET_URL in client
3. ⏳ Rebuild APK with `eas build`
4. 📱 Share APK with friends
5. 🌍 Chat with people worldwide!

---

## 💡 Pro Tips

1. **Keep logs open** during first deployment
2. **Test health endpoint** before updating client
3. **Commit often** to GitHub (auto-deploys)
4. **Use environment variables** for sensitive data
5. **Monitor usage** in Render dashboard

---

## 🆙 Upgrade Later (Optional)

If your app gets popular and you need:
- ✅ No spin-down (always on)
- ✅ Faster performance
- ✅ More resources

Upgrade to **Render Starter Plan** ($7/month)
- Or use Railway, Heroku, DigitalOcean

---

## 🎊 Congratulations!

You've deployed a production server!
This is a real accomplishment! 🏆

Now your app works anywhere in the world! 🌍
