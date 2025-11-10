# Deploying apps/api Backend

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (use Supabase, Neon, or Railway)

---

## Option 1: Vercel Deployment (Recommended)

### Step 1: Prepare Database

**Use a cloud PostgreSQL provider:**

#### A. **Supabase** (Recommended - Free tier)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### B. **Neon** (Serverless Postgres)
1. Go to https://neon.tech
2. Create project
3. Copy connection string

#### C. **Railway**
1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy connection string

### Step 2: Build the API

```powershell
cd "c:\Users\acer\Desktop\assignment 2\apps\api"

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Generate Prisma client
npm run db:generate
```

### Step 3: Deploy to Vercel

#### Via Vercel CLI:

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd "c:\Users\acer\Desktop\assignment 2\apps\api"
vercel --prod
```

#### Via Vercel Dashboard:

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository
4. Select `apps/api` as root directory
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build && npx prisma generate`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
VANNA_API_BASE_URL=https://your-vanna-ai.onrender.com
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Step 5: Setup Database Schema

```powershell
# Set your production DATABASE_URL
$env:DATABASE_URL="your_production_database_url"

# Push schema to production database
npm run db:push

# Optional: Seed data
npm run db:seed
```

---

## Option 2: Railway Deployment

### Step 1: Install Railway CLI

```powershell
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Railway

```powershell
cd "c:\Users\acer\Desktop\assignment 2\apps\api"

# Create new project
railway init

# Add PostgreSQL database
railway add postgresql

# Link to project
railway link
```

### Step 3: Deploy

```powershell
# Deploy
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
```

---

## Option 3: Render Deployment

### Step 1: Create `render.yaml`

Already created in your project.

### Step 2: Connect to Render

1. Go to https://render.com
2. New → Web Service
3. Connect your Git repository
4. Select `apps/api` directory
5. Configure:
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Step 3: Add PostgreSQL Database

1. In Render Dashboard → New → PostgreSQL
2. Copy Internal Database URL
3. Add to your web service environment variables

---

## Option 4: Docker Deployment (Any Cloud)

### Create Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

### Deploy to any cloud:
- Google Cloud Run
- AWS App Runner
- Azure Container Apps
- DigitalOcean App Platform

---

## Post-Deployment Checklist

✅ **Database Setup**
- [ ] Schema pushed (`npx prisma db push`)
- [ ] Data seeded (optional: `npm run db:seed`)

✅ **Environment Variables**
- [ ] `DATABASE_URL` set correctly
- [ ] `CORS_ORIGIN` points to frontend URL
- [ ] `VANNA_API_BASE_URL` set (if using AI features)

✅ **Testing**
- [ ] Visit `https://your-api-url.com/api/stats`
- [ ] Check API responds with data
- [ ] Test CORS from frontend

✅ **Update Frontend**
- [ ] Update `apps/web/.env.local`:
  ```
  NEXT_PUBLIC_API_BASE=https://your-api-url.com/api
  ```

---

## Quick Deploy Commands

### Vercel (Fastest):
```powershell
cd apps/api
npm run build
vercel --prod
```

### Railway:
```powershell
cd apps/api
railway up
```

### Manual Build:
```powershell
npm install
npm run build
npm run db:generate
npm start  # Runs on PORT from env
```

---

## Troubleshooting

**Error: "Prisma Client not generated"**
```powershell
npx prisma generate
```

**Error: "Database connection failed"**
- Check DATABASE_URL format
- Ensure database allows external connections
- Check IP whitelist settings

**Error: "CORS blocked"**
- Add frontend URL to CORS_ORIGIN
- Update CORS settings in `apps/api/src/index.ts`

**Port issues:**
- Vercel/Railway auto-assign PORT
- Use `process.env.PORT || 3001`

---

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | ✅ Yes |
| `PORT` | `3001` | No (auto-assigned) |
| `NODE_ENV` | `production` | ✅ Yes |
| `CORS_ORIGIN` | `https://app.vercel.app` | ✅ Yes |
| `VANNA_API_BASE_URL` | `https://ai.onrender.com` | Optional |

---

## Recommended Setup (Easiest)

1. **Database**: Supabase (free tier)
2. **API**: Vercel (free tier)
3. **Frontend**: Vercel (same account)
4. **AI Service**: Render (free tier)

**Total cost**: $0/month for development 🎉
