# 🚀 Quick Deployment Guide

## Server Changes Made

### Files Updated:
1. `server/src/types.ts` - Added `UserPreferences` interface
2. `server/src/matchmaker.ts` - Added smart matching algorithm
3. `server/src/index.ts` - Accept preferences in match:find event

---

## Deploy to Render.com

### Method 1: Git Push (Recommended)

```bash
# From project root
cd "d:\Games\Endless Runner"

# Add all changes
git add .

# Commit with message
git commit -m "feat: Add interest-based matching algorithm

- Added UserPreferences (interests, mood) to Session
- Implemented compatibility scoring (10pts per common interest, 5pts for same mood)
- Smart matching prioritizes users with common interests
- Fallback to random match after 10 seconds
- Added online/waiting user counters to health endpoint
"

# Push to GitHub
git push origin main
```

Render will automatically detect the push and redeploy (takes ~2-3 minutes).

---

### Method 2: Manual Deploy on Render Dashboard

1. Go to https://dashboard.render.com
2. Find your `anonchat` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for build to complete

---

## Testing Checklist

### 1. Test Health Endpoint
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "https://anonchat-jlsj.onrender.com/health"

# Should return:
# status        : ok
# ts            : 1760635868021
# onlineUsers   : 0
# waitingUsers  : 0
```

### 2. Test Interest Matching

**On Device 1:**
1. Open app
2. Tap "Start Chatting"
3. Select mood: "Happy 😊"
4. Select interests: "Music", "Gaming"
5. Tap "Find My Match! 🚀"
6. Should see "Searching for match..."

**On Device 2:**
1. Open app
2. Tap "Start Chatting"
3. Select mood: "Happy 😊"
4. Select interest: "Gaming"
5. Tap "Find My Match! 🚀"
6. Should **instantly match** with Device 1!

**Server Console Should Show:**
```
✨ Matched abc123 with def456 (score: 15)
```

---

### 3. Test Random Fallback

**On Device 1:**
1. Select interests: "Tech", "Books"
2. Find match → waits in queue

**On Device 2:**
1. Select interests: "Sports", "Fitness"  
2. Find match

**After 10 seconds:**
- Both devices should match anyway (fallback)

---

## Monitoring

### Check Render Logs
1. Go to Render dashboard
2. Click your service
3. Go to "Logs" tab
4. Look for:
   - `Server listening on 10000`
   - `socket connected ...`
   - `✨ Matched ...` (successful matches)
   - `🔍 ... added to queue` (waiting users)

### Watch Live Stats
```bash
# Continuously check online users
while ($true) { 
  Invoke-RestMethod "https://anonchat-jlsj.onrender.com/health" | 
  Select-Object status, onlineUsers, waitingUsers; 
  Start-Sleep 5 
}
```

---

## Rollback (If Something Goes Wrong)

### Option 1: Rollback on Render
1. Go to Render dashboard
2. Find your service
3. Click "Events" tab
4. Find previous successful deploy
5. Click "Rollback to this deploy"

### Option 2: Git Revert
```bash
# Revert last commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

---

## Environment Variables (Already Set ✅)

These should already be configured on Render:
- `PORT` - Auto-set by Render
- `NODE_ENV` - production

No new env vars needed for this update.

---

## Expected Timeline

1. **Git push** → 10 seconds
2. **Render detects** → 30 seconds  
3. **Build starts** → 1 minute
4. **Deploy completes** → 2-3 minutes total

Watch for: "Live" status in Render dashboard

---

## Success Indicators

✅ Build log shows: `Successfully installed`
✅ Deploy log shows: `Server listening on 10000`
✅ Health endpoint returns `onlineUsers` and `waitingUsers`
✅ App can match users with common interests
✅ Console shows `✨ Matched` with score

---

## Quick Commands Reference

```bash
# Build locally
cd server
npm run build

# Test locally
npm start

# Commit and push
git add .
git commit -m "your message"
git push origin main

# Check server health
Invoke-RestMethod https://anonchat-jlsj.onrender.com/health
```

---

## Next Steps After Deploy

1. Test with real devices
2. Share app with friends
3. Monitor match success rate
4. Add more features:
   - Avatars (DiceBear API)
   - Nicknames generator
   - Online counter on welcome screen
   - Message reactions

---

**Ready to deploy? Push to Git! 🚀**
