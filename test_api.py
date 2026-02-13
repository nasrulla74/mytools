import httpx

# Test health first
r = httpx.get('http://localhost:8000/health')
print(f"Health: {r.status_code} {r.text}")

# Test with verbose error
r = httpx.post('http://localhost:8000/run', json={'code': 'print(42)'})
print(f"Run Status: {r.status_code}")
print(f"Run Response: {r.text}")

# Also try the OpenAPI docs endpoint to check if server reloaded
r2 = httpx.get('http://localhost:8000/openapi.json')
print(f"OpenAPI: {r2.status_code}")
