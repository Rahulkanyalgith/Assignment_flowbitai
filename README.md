# Analytics Dashboard - Full Stack Application

> **A production-grade analytics dashboard with AI-powered natural language queries, built with Next.js, Express, PostgreSQL, and Vanna AI.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)

## 📸 Features

### 📊 Interactive Analytics Dashboard
- **Real-time KPI Cards**: Total Spend, Invoices, Documents, Average Value
- **Dynamic Charts**: Line, Bar, and Pie charts with Recharts
- **Smart Table**: Searchable, sortable, paginated invoices
- **Responsive Design**: Pixel-perfect implementation of Figma designs

### 🤖 AI-Powered Chat Interface
- **Natural Language Queries**: Ask questions in plain English
- **SQL Generation**: Powered by Vanna AI + Groq LLM
- **Real-time Results**: See generated SQL and query results
- **Interactive Visualization**: Results displayed in tables

## 🏗️ Architecture

This is a monorepo using npm workspaces with three main applications:

- **apps/web** - Next.js 14 frontend (Analytics Dashboard + Chat UI)
- **apps/api** - Express.js backend (REST API + PostgreSQL)
- **apps/vanna-ai** - Python FastAPI server (Vanna AI + Groq LLM)

## 🚀 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL

### AI Layer
- Vanna AI (self-hosted)
- Groq LLM
- Python FastAPI

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ PostgreSQL >= 14
- ✅ Python >= 3.9
- ✅ Groq API Key ([Get one here](https://console.groq.com))

## ⚡ Quick Start

**New to this project?** Follow our step-by-step guide: **[QUICKSTART.md](QUICKSTART.md)**

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Configure Database

```sql
-- Create PostgreSQL database
CREATE DATABASE analytics_db;
CREATE USER analytics_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;
```

### 3. Environment Variables

Create `.env` files in each app:

#### apps/api/.env
```env
DATABASE_URL="postgresql://user:password@localhost:5432/analytics_db"
PORT=3001
VANNA_API_BASE_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:3000"
```

#### apps/web/.env.local
```env
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### apps/vanna-ai/.env
```env
DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/analytics_db"
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

### 4. Database Setup

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Place your Analytics_Test_Data.json in apps/api/

# Seed database
npm run db:seed
```

**📝 Note**: See [DATA_FORMAT.md](DATA_FORMAT.md) for the expected JSON structure.

### 5. Install Python Dependencies (Vanna AI)

```bash
cd apps/vanna-ai
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 6. Run Development Servers

Open **3 separate terminals**:

**Terminal 1 - Backend API:**
```bash
npm run dev:api
# 🚀 API Server running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
# ✓ Ready on http://localhost:3000
```

**Terminal 3 - Vanna AI:**
```bash
cd apps/vanna-ai
venv\Scripts\activate
python app.py
# 🚀 Vanna AI server on http://localhost:8000
```

**Access the app**: Open http://localhost:3000 in your browser

## 🎯 What You Get

### 📊 Analytics Dashboard Tab
1. **4 KPI Overview Cards**
   - Total Spend (Year-to-Date)
   - Total Invoices Processed
   - Documents Uploaded
   - Average Invoice Value

2. **5 Interactive Charts**
   - Invoice Volume & Value Trend (Dual-axis Line Chart)
   - Top 10 Vendors by Spend (Horizontal Bar Chart)
   - Spend by Category (Pie Chart)
   - Cash Outflow Forecast (Bar Chart)

3. **Smart Invoices Table**
   - Real-time search across invoice number, vendor, status
   - Sortable columns
   - Status badges with color coding
   - Pagination support

### 💬 Chat with Data Tab
- Natural language query interface
- AI-powered SQL generation (Vanna AI + Groq)
- SQL query display with syntax highlighting
- Interactive results tables
- Example questions to get started
- Error handling and helpful messages

## 🌐 Deployment

### Frontend + Backend (Vercel)
```bash
npm run build
vercel --prod
```

### Vanna AI (Render/Railway/Fly.io)
Deploy the `apps/vanna-ai` directory to your preferred hosting platform.

## 📁 Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express backend
│   └── vanna-ai/     # Python AI server
├── package.json      # Root workspace config
└── README.md
```

## 🔗 API Endpoints

- `GET /api/stats` - Overview statistics
- `GET /api/invoice-trends` - Monthly trends
- `GET /api/vendors/top10` - Top vendors
- `GET /api/category-spend` - Category breakdown
- `GET /api/cash-outflow` - Cash forecast
- `GET /api/invoices` - Invoice list with filters
- `POST /api/chat-with-data` - AI chat queries

## � Complete Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | Step-by-step setup checklist with troubleshooting |
| **[SETUP.md](SETUP.md)** | Detailed setup instructions |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment guide (Vercel, Render, etc.) |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete API reference with examples |
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | Architecture and technical details |
| **[DATA_FORMAT.md](DATA_FORMAT.md)** | Expected JSON data structure |

## 🎨 Design

This project implements a **pixel-perfect** recreation of the provided Figma design:
- [View Figma Design](https://www.figma.com/slides/owNIgQXAZbOqVHCO8o5tXY/thisis?node-id=1-1566&t=QKmc3raNSDeUVUgw-1)

## 🧪 Testing the Application

### Test Analytics Dashboard
1. Visit http://localhost:3000
2. Click "Analytics Dashboard" tab
3. Verify all 4 overview cards show data
4. Check that all charts render
5. Use search in invoices table
6. Test table sorting

### Test Chat with Data
1. Click "Chat with Data" tab
2. Try example questions:
   - "What's the total spend in the last 90 days?"
   - "List top 5 vendors by spend"
   - "Show overdue invoices as of today"
3. Verify SQL generation and results display

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
# Windows: Get-Service postgresql*
# Test: psql -U analytics_user -d analytics_db
```

**Prisma Client Not Generated:**
```bash
cd apps/api
npx prisma generate
```

**No Data in Dashboard:**
```bash
cd apps/api
npx prisma db push --force-reset
npm run db:seed
```

See [QUICKSTART.md](QUICKSTART.md) for complete troubleshooting guide.

## 🚢 Deployment

Ready for production? Follow our comprehensive deployment guide:

1. **Database**: Deploy to Supabase, Neon, or Railway
2. **Backend + Frontend**: Deploy to Vercel
3. **Vanna AI**: Deploy to Render, Railway, or Fly.io

**See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.**

## 📁 Project Structure

```
analytics-dashboard/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   │   ├── ui/        # shadcn/ui components
│   │   │   │   └── dashboard/ # Dashboard components
│   │   │   └── lib/           # Utilities & API client
│   │   └── package.json
│   │
│   ├── api/                    # Express Backend
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── lib/           # Database utilities
│   │   │   ├── index.ts       # Server entry
│   │   │   └── seed.ts        # Data seeding
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── package.json
│   │
│   └── vanna-ai/               # Python AI Server
│       ├── app.py             # FastAPI application
│       ├── requirements.txt   # Python dependencies
│       └── .env.example
│
├── Documentation Files:
├── README.md                   # This file
├── QUICKSTART.md              # Quick setup guide
├── SETUP.md                   # Detailed setup
├── DEPLOYMENT.md              # Deployment guide
├── API_DOCUMENTATION.md       # API reference
├── PROJECT_OVERVIEW.md        # Technical overview
├── DATA_FORMAT.md             # JSON structure guide
│
└── package.json               # Root workspace config
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run all services
npm run dev

# Run individual services
npm run dev:web      # Frontend only
npm run dev:api      # Backend only
npm run dev:vanna    # Vanna AI only

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio GUI

# Build for production
npm run build
npm run build:web    # Build frontend
npm run build:api    # Build backend
```

## 🔐 Security

- CORS properly configured
- Environment variables for sensitive data
- SQL injection prevention via Prisma ORM
- Input validation on all endpoints
- Secure database connections

## 🎯 Next Steps

After getting the app running:

1. ✅ Review the [Figma design](https://www.figma.com/slides/owNIgQXAZbOqVHCO8o5tXY/thisis?node-id=1-1566&t=QKmc3raNSDeUVUgw-1)
2. ✅ Add your `Analytics_Test_Data.json` file
3. ✅ Test all features thoroughly
4. ✅ Customize branding/colors if needed
5. ✅ Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
6. ✅ Set up monitoring and analytics

## 💡 Pro Tips

- **Keep 3 terminals open** for the 3 services
- **Use Prisma Studio** (`npx prisma studio`) to view database
- **Check browser console** (F12) for frontend errors
- **Monitor API logs** in Terminal 1 for debugging
- **Test incrementally** as you build features

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## �📝 License

MIT License - see LICENSE file for details
