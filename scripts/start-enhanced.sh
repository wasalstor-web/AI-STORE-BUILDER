#!/bin/bash
# Enhanced AI Store Builder - Quick Start Script
# Sets up and runs the enhanced Claude AI integration

echo "🚀 Starting Enhanced AI Store Builder..."
echo "====================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed  
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
if [ -f "requirements-claude.txt" ]; then
    pip install -r requirements-claude.txt
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Set environment variables if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOF
# Database
DATABASE_URL=sqlite:///./ai_store_builder.db

# JWT Secret (Generate new one for production: openssl rand -hex 64)
JWT_SECRET_KEY=CHANGE-ME-IN-PRODUCTION-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# AI & Supabase Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-anon-key-here

# AI Settings
CLAUDE_MODEL=claude-3-sonnet-20240229
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
ENABLE_WEBSOCKETS=true

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Development
DEBUG=true
APP_ENV=development
EOF
    echo "🔧 Created .env file - Please update with your API keys!"
fi

# Initialize database
echo "🗄️  Initializing database..."
python -c "
import asyncio
from app.database import engine
from app.models.base import Base

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Database tables created successfully')
    
asyncio.run(create_tables())
"

# Start services
echo "🎯 Starting services..."

# Start backend in background
echo "🔥 Starting FastAPI backend on http://localhost:8000..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend in background  
echo "⚛️  Starting React frontend on http://localhost:3003..."
cd frontend
npm run dev -- --port 3003 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Enhanced AI Store Builder is running!"
echo "====================================="
echo "🌐 Frontend:  http://localhost:3003"  
echo "🔧 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo "🤖 AI Live:   ws://localhost:8000/api/v1/ai/live"
echo ""
echo "🔑 To stop services: Ctrl+C"
echo "📱 Test AI endpoint: curl http://localhost:8000/api/v1/ai/health"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
wait