try:
    import requests
except ImportError:
    print("❌ 'requests' library not installed. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

import json
import time

def test_local_servers():
    """Test both local backend and frontend"""
    
    # Test Backend
    print("🔍 Testing Backend (API)...")
    try:
        resp = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if resp.status_code == 200:
            print("✅ Backend is running on http://127.0.0.1:8000")
            print(f"📊 Response: {resp.json()}")
        else:
            print(f"⚠️  Backend responded with status {resp.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running on port 8000")
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
    
    print()
    
    # Test Frontend
    print("🔍 Testing Frontend...")
    for port in [3000, 3001, 3002, 3003, 3004, 3005]:
        try:
            resp = requests.get(f"http://localhost:{port}", timeout=3)
            if resp.status_code == 200:
                print(f"✅ Frontend is running on http://localhost:{port}")
                break
        except:
            continue
    else:
        print("❌ Frontend is NOT running on any common ports")
    
    print()
    
    # Test Production API
    print("🔍 Testing Production API...")
    try:
        resp = requests.get("http://147.93.120.99:9000/health", timeout=10)
        if resp.status_code == 200:
            print("✅ Production API is running")
            print(f"📊 Response: {resp.json()}")
        else:
            print(f"⚠️  Production API responded with status {resp.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Production API is NOT reachable")
    except Exception as e:
        print(f"❌ Production API test failed: {e}")

if __name__ == "__main__":
    print("🏥 AI Store Builder Health Check\n")
    test_local_servers()
    print("\n🏁 Health check complete!")