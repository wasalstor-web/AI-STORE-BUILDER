#!/usr/bin/env python3
"""
Test script to run AI Store Builder backend locally
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Run the backend server locally"""
    # Set working directory to script location
    script_dir = Path(__file__).parent.resolve()
    os.chdir(script_dir)
    
    print("🚀 Starting AI Store Builder Backend")
    print(f"📁 Working directory: {script_dir}")
    print(f"🐍 Python: {sys.executable}")
    
    # Test imports first
    try:
        print("📦 Testing imports...")
        from app.config import get_settings
        settings = get_settings()
        print(f"✅ Environment: {settings.APP_ENV}")
        print(f"✅ Database: {settings.DATABASE_URL}")
        print(f"✅ Host: {settings.HOST}:{settings.PORT}")
        print(f"✅ AI Provider: {settings.AI_PRIMARY_PROVIDER}")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return 1
    
    # Start the server
    try:
        print("\n🌟 Starting uvicorn server...")
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", settings.HOST,
            "--port", str(settings.PORT),
            "--reload",
            "--log-level", "info"
        ]
        print(f"🔧 Command: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n✋ Server stopped by user")
        return 0
    except Exception as e:
        print(f"❌ Server failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())