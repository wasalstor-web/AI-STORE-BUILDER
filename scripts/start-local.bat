@echo off
chcp 65001 >nul
echo ============================================
echo   AI Store Builder - Local Development
echo ============================================
echo.
cd /d "%~dp0"
echo [1/4] Testing Python...
python --version || goto error
echo.

echo [2/4] Testing Backend Configuration...
python -c "from app.config import get_settings; s = get_settings(); print(f'Environment: {s.APP_ENV}'); print(f'Database: {s.DATABASE_URL}'); print(f'Host: {s.HOST}:{s.PORT}')" || goto error
echo.

echo [3/4] Starting Backend Server...
echo Backend will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo Frontend is running on: http://localhost:3005
echo.
echo Press Ctrl+C to stop the server
echo.

echo [4/4] Launching...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info
goto end

:error
echo.
echo ERROR: Something went wrong. Please check:
echo 1. Python is installed and in PATH
echo 2. Virtual environment is activated  
echo 3. Requirements are installed: pip install -r requirements.txt
pause

:end
echo.
echo Server stopped.
pause