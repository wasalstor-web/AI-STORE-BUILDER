"""Quick test for auth endpoints locally."""
import httpx
import json
import sys

BASE = "http://localhost:8000/api/v1"

def test_register():
    print("=" * 50)
    print("1. Testing REGISTER...")
    try:
        r = httpx.post(f"{BASE}/auth/register", json={
            "email": "test@example.com",
            "password": "Test12345",
            "full_name": "Test User",
            "tenant_name": "Test Store"
        }, timeout=10)
        print(f"   Status: {r.status_code}")
        data = r.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        if r.status_code in (201, 409):
            return data if r.status_code == 201 else None
        return None
    except Exception as e:
        print(f"   ERROR: {e}")
        return None


def test_login():
    print("=" * 50)
    print("2. Testing LOGIN...")
    try:
        r = httpx.post(f"{BASE}/auth/login", json={
            "email": "test@example.com",
            "password": "Test12345",
        }, timeout=10)
        print(f"   Status: {r.status_code}")
        data = r.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        if r.status_code == 200:
            return data
        return None
    except Exception as e:
        print(f"   ERROR: {e}")
        return None


def test_me(token):
    print("=" * 50)
    print("3. Testing GET /auth/me...")
    try:
        r = httpx.get(f"{BASE}/auth/me", headers={
            "Authorization": f"Bearer {token}"
        }, timeout=10)
        print(f"   Status: {r.status_code}")
        data = r.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return data if r.status_code == 200 else None
    except Exception as e:
        print(f"   ERROR: {e}")
        return None


def test_ai_chat(token):
    print("=" * 50)
    print("4. Testing AI Chat...")
    try:
        r = httpx.post(f"{BASE}/ai/chat", json={
            "message": "Hello, create a simple electronics store",
            "store_type": "electronics",
            "language": "ar"
        }, headers={
            "Authorization": f"Bearer {token}"
        }, timeout=30)
        print(f"   Status: {r.status_code}")
        data = r.json()
        # Truncate long responses
        resp_str = json.dumps(data, indent=2, ensure_ascii=False)
        if len(resp_str) > 500:
            print(f"   Response (truncated): {resp_str[:500]}...")
        else:
            print(f"   Response: {resp_str}")
        return data
    except Exception as e:
        print(f"   ERROR: {e}")
        return None


def test_health():
    print("=" * 50)
    print("0. Testing HEALTH...")
    try:
        r = httpx.get("http://localhost:8000/health", timeout=5)
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json()}")
        return r.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


if __name__ == "__main__":
    print("AI Store Builder - Auth & AI Test")
    print("=" * 50)
    
    # Health check
    if not test_health():
        print("\nBackend is not running! Start it first.")
        sys.exit(1)
    
    # Register
    reg_data = test_register()
    
    # Login
    login_data = test_login()
    
    if login_data and "access_token" in login_data:
        token = login_data["access_token"]
        
        # Get me
        test_me(token)
        
        # AI Chat
        test_ai_chat(token)
    else:
        print("\nLogin failed - cannot test authenticated endpoints")
    
    print("\n" + "=" * 50)
    print("TESTS COMPLETE")
