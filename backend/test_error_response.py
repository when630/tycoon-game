import requests
import random
import string

BASE_URL = "http://localhost:8080/api/v1"
NICKNAME = "ErrorTester_" + ''.join(random.choices(string.ascii_letters + string.digits, k=6))

def test_error_handling():
    print(f"Creating user {NICKNAME}...")
    auth_url = f"{BASE_URL}/auth/login"
    resp = requests.post(auth_url, json={"nickname": NICKNAME})
    if resp.status_code != 200:
        print("[FAIL] Login failed")
        return
    
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # User starts with 10,000 Gold.
    # Relic Gacha costs 5,000 Gold.
    # 1st Gacha: 10,000 -> 5,000 (Success)
    # 2nd Gacha: 5,000 -> 0 (Success)
    # 3rd Gacha: 0 -> Error (Fail)
    
    print("Spending gold on Gacha...")
    for i in range(1, 4):
        print(f"Gacha attempt #{i}...")
        resp = requests.post(f"{BASE_URL}/relic/gacha", headers=headers)
        
        if i <= 2:
            if resp.status_code == 200:
                print(f"[PASS] Gacha #{i} Success")
            else:
                print(f"[FAIL] Gacha #{i} Failed unexpectedly: {resp.text}")
        else:
            # Should fail
            if resp.status_code == 400:
                data = resp.json()
                if "error" in data and "Not enough gold" in data["error"]:
                     print(f"[PASS] Error caught correctly: {data['error']}")
                else:
                     print(f"[FAIL] Error format mismatch: {resp.text}")
            else:
                print(f"[FAIL] Expected 400 but got {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    test_error_handling()
