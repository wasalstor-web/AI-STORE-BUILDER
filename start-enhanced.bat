@echo off
REM Enhanced AI Store Builder - Windows Start Script
REM Sets up and runs the enhanced Claude AI integration

echo 🚀 Starting Enhanced AI Store Builder...
echo =====================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if exist requirements-claude.txt (
    pip install -r requirements-claude.txt
)

REM Install Node.js dependencies  
echo 📦 Installing Node.js dependencies...
cd frontend
call npm install
cd ..

REM Set environment variables if .env doesn't exist
if not exist ".env" (
    echo ⚙️  Creating environment configuration...
    (
        echo # Database
        echo DATABASE_URL=sqlite:///./ai_store_builder.db
        echo.
        echo # JWT Secret ^(Generate new one for production: openssl rand -hex 64^)
        echo JWT_SECRET_KEY=CHANGE-ME-IN-PRODUCTION-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
        echo.
        echo # AI ^& Supabase Configuration
        echo ANTHROPIC_API_KEY=your-anthropic-api-key-here
        echo SUPABASE_URL=your-supabase-url-here
        echo SUPABASE_KEY=your-supabase-anon-key-here
        echo.
        echo # AI Settings
        echo CLAUDE_MODEL=claude-3-sonnet-20240229
        echo AI_TEMPERATURE=0.7
        echo AI_MAX_TOKENS=4096
        echo ENABLE_WEBSOCKETS=true
        echo.
        echo # Redis ^(optional^)
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # Development
        echo DEBUG=true
        echo APP_ENV=development
    ) > .env
    echo 🔧 Created .env file - Please update with your API keys!
)

REM Initialize database
echo 🗄️  Initializing database...
python -c "import asyncio; from app.database import engine; from app.models.base import Base; exec('async def create_tables():\n    async with engine.begin() as conn:\n        await conn.run_sync(Base.metadata.create_all)\n    print(\"✅ Database tables created successfully\")\n\nasyncio.run(create_tables())')"

REM Start services
echo 🎯 Starting services...

REM Start backend
echo 🔥 Starting FastAPI backend on http://localhost:8000...
start "AI Store Builder Backend" cmd /c "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo ⚛️  Starting React frontend on http://localhost:3003...
cd frontend
start "AI Store Builder Frontend" cmd /c "npm run dev -- --port 3003"
cd ..

echo.
echo ✅ Enhanced AI Store Builder is running!
echo =====================================
echo 🌐 Frontend:  http://localhost:3003
echo 🔧 Backend:   http://localhost:8000  
echo 📚 API Docs:  http://localhost:8000/docs
echo 🤖 AI Live:   ws://localhost:8000/api/v1/ai/live
echo.
echo 🔑 To stop: Close terminal windows
echo 📱 Test AI: curl http://localhost:8000/api/v1/ai/health
echo.

pause