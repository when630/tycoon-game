import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8080/api/v1"
USERNAME = "debug_user_" + str(sys.argv[1]) if len(sys.argv) > 1 else "debug_user_1"
PASSWORD = "password123"

def login():
    session = requests.Session()
    # 1. Login (Auto-signup)
    login_payload = {"nickname": USERNAME}
    print(f"Logging in with: {login_payload}")
    
    try:
        res = session.post(f"{BASE_URL}/auth/login", json=login_payload)
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} {res.text}")
            sys.exit(1)
        
        data = res.json()
        token = data.get("token") # Note: Check if key is 'token' or 'accessToken'. Controller says 'token'.
        if not token:
             # Fallback if key is different
             token = data.get("accessToken")
             
        print(f"Got token: {token[:10]}...")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    except Exception as e:
        print(f"Login error: {e}")
        sys.exit(1)

def test_contract_flow():
    session = login()
    print(f"Logged in as {USERNAME}")

    # 1. Check Available Contracts (Should be empty initially or have some)
    res = session.get(f"{BASE_URL}/contract/available")
    print(f"GET /available: {res.status_code}")
    print(res.json())

    # 2. Generate Available Contracts
    res = session.post(f"{BASE_URL}/contract/available/generate")
    print(f"POST /available/generate: {res.status_code}")
    if res.status_code == 200:
        contracts = res.json()
        print(f"Generated {len(contracts)} contracts")
        if len(contracts) > 0:
            first_id = contracts[0]['id']
            print(f"First contract ID: {first_id}, Status: {contracts[0]['status']}")
            
            # 3. Accept Contract
            res = session.post(f"{BASE_URL}/contract/accept/{first_id}")
            print(f"POST /accept/{first_id}: {res.status_code}")
            print(res.json())
            
            # 4. Check My Active Contracts
            res = session.get(f"{BASE_URL}/contract/my")
            print(f"GET /my: {res.status_code}")
            my_contracts = res.json()
            print(f"Active contracts count: {len(my_contracts)}")
            found = any(c['id'] == first_id for c in my_contracts)
            print(f"Contract {first_id} found in active list: {found}")

    else:
        print(f"Failed to generate: {res.text}")

if __name__ == "__main__":
    test_contract_flow()
