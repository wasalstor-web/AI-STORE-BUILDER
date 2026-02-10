"""Test AI chat endpoint with auth through Vite proxy."""
import httpx
import json

BASE = "http://localhost:3000/api/v1"

# Step 1: Login
print("Logging in...")
r = httpx.post(f"{BASE}/auth/login", json={
    "email": "test@example.com",
    "password": "Test12345"
}, timeout=10)
print(f"Login status: {r.status_code}")
tokens = r.json()
token = tokens["access_token"]
print(f"Token: {token[:40]}...")

# Step 2: Test AI Chat
print("\nSending AI chat request...")
r = httpx.post(f"{BASE}/ai/chat", json={
    "message": "Hello, create a simple electronics store",
    "current_html": "<html><body><h1>Test Store</h1></body></html>",
    "store_name": "Test Store",
    "store_type": "electronics"
}, headers={
    "Authorization": f"Bearer {token}"
}, timeout=60)
print(f"AI Chat status: {r.status_code}")
data = r.json()
if r.status_code == 200:
    print(f"Message: {data.get('message', 'N/A')}")
    print(f"Execution time: {data.get('execution_time', 'N/A')}s")
    html = data.get('html', '')
    print(f"HTML length: {len(html)} chars")
    if html:
        print(f"HTML starts with: {html[:100]}...")
    print(f"Suggestions: {data.get('suggestions', [])}")
else:
    print(f"Error: {json.dumps(data, indent=2, ensure_ascii=False)}")
