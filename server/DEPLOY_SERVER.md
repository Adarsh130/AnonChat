# 🌐 Deploy Server for Public Access

## Why You Need This

Your server currently runs on `http://10.92.23.113:3001` which only works on your local network.
To share your app with others, you need to deploy the server to a public URL.

---

## 🚀 Option 1: Render (Recommended - Free & Easy)

### Step 1: Create Render Account
- Go to: https://render.com
- Sign up with GitHub or email (free)

### Step 2: Prepare Your Server
1. Create `.gitignore` in server folder:
```
node_modules/
.env
*.log
```

2. Add start script to `package.json`:
```json
{
  "scripts": {
    "start": "node --loader ts-node/esm src/index.ts",
    "dev": "nodemon --exec node --loader ts-node/esm src/index.ts",
    "build": "tsc"
  }
}
```

### Step 3: Push to GitHub
```powershell
cd "d:\Games\Endless Runner\server"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/anonchat-server.git
git push -u origin main
```

### Step 4: Deploy on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name:** anonchat-server
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment

### Step 5: Get Your URL
Your server will be at: `https://anonchat-server.onrender.com`

---

## 🚀 Option 2: Railway (Also Free & Fast)

### Step 1: Create Account
- Go to: https://railway.app
- Sign up with GitHub (free $5 credit/month)

### Step 2: Deploy
```powershell
npm install -g @railway/cli
railway login
cd "d:\Games\Endless Runner\server"
railway init
railway up
```

### Step 3: Get URL
```powershell
railway domain
```

Your server: `https://your-app.up.railway.app`

---

## 🚀 Option 3: Heroku (Classic Choice)

### Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Login and Create App
```powershell
cd "d:\Games\Endless Runner\server"
heroku login
heroku create anonchat-server
```

### Step 3: Deploy
```powershell
git init
git add .
git commit -m "Deploy"
git push heroku main
```

### Step 4: Get URL
Your server: `https://anonchat-server.herokuapp.com`

---

## 🔧 Update Your Client App

After deploying, update the socket URL:

### File: `client/services/socket.ts`

```typescript
// Change this line:
const SOCKET_URL = 'http://10.92.23.113:3001';

// To your deployed URL:
const SOCKET_URL = 'https://anonchat-server.onrender.com';
// or
const SOCKET_URL = 'https://your-app.up.railway.app';
// or
const SOCKET_URL = 'https://anonchat-server.herokuapp.com';
```

**Important:** Use `https://` (not `http://`) for production!

---

## ✅ Test Your Deployed Server

### 1. Check Health Endpoint
Open browser: `https://your-server-url.com/health`

Should show:
```json
{
  "status": "ok",
  "ts": 1234567890
}
```

### 2. Test with Your App
1. Update SOCKET_URL in client code
2. Rebuild APK: `eas build -p android --profile preview`
3. Install and test

---

## 🔒 Environment Variables (Optional)

If you have sensitive data:

### Render:
- Dashboard → Environment → Add Variable
- `PORT=3001`

### Railway:
```powershell
railway variables set PORT=3001
```

### Heroku:
```powershell
heroku config:set PORT=3001
```

---

## 📊 Server Limits (Free Tiers)

### Render (Free)
- ✅ 750 hours/month
- ✅ Auto-sleeps after 15 min inactivity
- ✅ Wakes up in ~30 seconds
- ⚠️ May spin down if unused

### Railway
- ✅ $5 free credit/month
- ✅ ~500 hours of uptime
- ✅ No sleep

### Heroku (Free tier ended, but...)
- 💰 $7/month for hobby tier
- ✅ Always on
- ✅ Better for production

---

## 🚨 Important Notes

### WebSocket Support
All these platforms support WebSocket (required for Socket.io)

### CORS Configuration
Your server already has CORS enabled:
```typescript
cors: {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
}
```

### Port Configuration
Most platforms set PORT automatically. Your code handles this:
```typescript
const PORT = Number(process.env.PORT ?? 3001);
```

---

## 🎯 Complete Deployment Checklist

- [ ] Choose hosting platform (Render recommended)
- [ ] Create account
- [ ] Push server code to GitHub (optional for Render)
- [ ] Deploy server
- [ ] Test `/health` endpoint
- [ ] Copy server URL
- [ ] Update `SOCKET_URL` in `client/services/socket.ts`
- [ ] Rebuild APK with `eas build -p android --profile preview`
- [ ] Test app with new server
- [ ] Share APK with others!

---

## 🔄 Rebuilding After Server Update

```powershell
cd "d:\Games\Endless Runner\client"
eas build -p android --profile preview
```

Wait 15 minutes, download new APK, done!

---

## 💡 Pro Tips

1. **Use Preview Build** for testing (faster, smaller)
2. **Test health endpoint** before rebuilding app
3. **Keep server running** by pinging it every 10 minutes
4. **Monitor logs** on your hosting platform
5. **Upgrade plan** if you get lots of users

---

## 📱 Final Steps

1. Deploy server → Get URL
2. Update client code → `SOCKET_URL`
3. Build APK → `eas build`
4. Download → Install → Test
5. Share with world → 🎉

---

## 🆘 Troubleshooting

### Server won't start
- Check logs on hosting platform
- Ensure `package.json` has correct start script
- Verify TypeScript compilation works

### Can't connect from app
- Check SOCKET_URL is correct
- Use `https://` not `http://`
- Test health endpoint in browser
- Check server logs for connection attempts

### WebSocket errors
- Ensure hosting platform supports WebSockets
- All recommended platforms do!

---

## 🎉 You're Production Ready!

With server deployed and APK built, your app is ready for:
- ✅ Sharing with friends
- ✅ Beta testing
- ✅ Publishing to Play Store
- ✅ Real-world usage

Congratulations! 🚀
