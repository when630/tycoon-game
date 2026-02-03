import requests
import json
import time

import random
import string

BASE_URL = "http://localhost:8080/api/v1"
NICKNAME = "Tester_" + ''.join(random.choices(string.ascii_letters + string.digits, k=6))

def print_result(name, success, response=None):
    if success:
        print(f"[PASS] {name}")
    else:
        print(f"[FAIL] {name}")
        if response:
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")

def run_tests():
    print("Starting API Tests...")
    
    # 1. Auth Login
    print("\n--- Testing Auth ---")
    auth_url = f"{BASE_URL}/auth/login"
    try:
        resp = requests.post(auth_url, json={"nickname": NICKNAME})
        if resp.status_code == 200:
            token = resp.json().get("token")
            if token:
                print_result("Login", True)
            else:
                print_result("Login (No Token)", False, resp)
                return
        else:
            print_result("Login", False, resp)
            return
    except Exception as e:
        print(f"[FAIL] Login Exception: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Ranking
    print("\n--- Testing Ranking ---")
    try:
        resp = requests.get(f"{BASE_URL}/rank/level", headers=headers)
        print_result("Get Level Ranking", resp.status_code == 200, resp)
        
        resp = requests.get(f"{BASE_URL}/rank/rich", headers=headers)
        print_result("Get Rich Ranking", resp.status_code == 200, resp)
    except Exception as e:
        print(f"Ranking Exception: {e}")

    # 2.5 User Info
    print("\n--- Testing User Info ---")
    try:
        resp = requests.get(f"{BASE_URL}/user/me", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if "gold" in data:
                 print_result("Get User Info (Gold Check)", True)
            else:
                 print_result("Get User Info (Gold Missing)", False, resp)
        else:
             print_result("Get User Info", False, resp)
    except Exception as e:
        print(f"User Info Exception: {e}")

    # 3. Game (Enhance)
    print("\n--- Testing Game (Enhance) ---")
    try:
        # Mocking a request, assuming we have items or logic. 
        # EnhanceDto.Request: itemBaseValue, currentLevel
        # Note: In a real scenario we might need to know "what" we are enhancing, 
        # but the controller just takes params and uses userId. 
        # It seems EnhanceService might be stateless regarding 'which item' or assumes a single item per user?
        # Let's check logic implies it uses user's current state.
        enhance_req = {"itemBaseValue": 100, "currentLevel": 0} 
        resp = requests.post(f"{BASE_URL}/game/enhance", json=enhance_req, headers=headers)
        print_result("Enhance Item", resp.status_code == 200, resp)
    except Exception as e:
        print(f"Game Exception: {e}")

    # 4. Relic
    print("\n--- Testing Relic ---")
    try:
        resp = requests.get(f"{BASE_URL}/relic/my", headers=headers)
        print_result("Get User Relics", resp.status_code == 200, resp)
        
        resp = requests.post(f"{BASE_URL}/relic/gacha", headers=headers)
        print_result("Gacha Relic", resp.status_code == 200, resp)
    except Exception as e:
        print(f"Relic Exception: {e}")

    # 5. Contract
    print("\n--- Testing Contract ---")
    try:
        # Generate new contract
        resp = requests.post(f"{BASE_URL}/contract/new", headers=headers)
        print_result("Generate Contract", resp.status_code == 200, resp)
        
        # Get current contract
        resp = requests.get(f"{BASE_URL}/contract/current", headers=headers)
        print_result("Get Current Contract", resp.status_code == 200, resp)
        
        # Complete contract
        complete_req = {"itemLevel": 10}
        resp = requests.post(f"{BASE_URL}/contract/complete", json=complete_req, headers=headers)
        # Note: This might fail if no contract exists or conditions met, but endpoint should be reachable
        print_result("Complete Contract", resp.status_code == 200 or resp.status_code == 400, resp) 
    except Exception as e:
        print(f"Contract Exception: {e}")

if __name__ == "__main__":
    run_tests()
