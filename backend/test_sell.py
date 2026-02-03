import requests
import random
import string
import time

BASE_URL = "http://localhost:8080/api/v1"
NICKNAME = "SellTester_" + ''.join(random.choices(string.ascii_letters + string.digits, k=6))

def test_sell():
    print(f"Creating user {NICKNAME}...")
    auth_url = f"{BASE_URL}/auth/login"
    resp = requests.post(auth_url, json={"nickname": NICKNAME})
    if resp.status_code != 200:
        print(f"[FAIL] Login failed: {resp.text}")
        return
    
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Enhance to +1
    print("Enhancing to +1...")
    enhance_payload = {"itemBaseValue": 100, "currentLevel": 0}
    resp = requests.post(f"{BASE_URL}/game/enhance", headers=headers, json=enhance_payload)
    if resp.status_code != 200:
        print(f"[FAIL] Enhance failed: {resp.text}")
        return
    
    data = resp.json()
    if data["result"] == "SUCCESS" and data["newLevel"] == 1:
        print("[PASS] Enhanced to +1")
    else:
        print(f"[FAIL] Enhance did not succeed: {data}")
        return

    # 2. Sell
    # Cost for 0->1 is 100 * (0+1)^2 = 100.
    # Expected Reward = 100 * 1.2 = 120.
    print("Selling +1 Item...")
    sell_payload = {"currentLevel": 1, "itemBaseValue": 100}
    resp = requests.post(f"{BASE_URL}/game/sell", headers=headers, json=sell_payload)
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"[PASS] Sold successfully: {data['message']}")
        if data["reward"] == 120:
            print(f"[PASS] Reward calculation correct (120)")
        else:
            print(f"[WARN] Reward mismatch. Got {data['reward']}, expected 120")
    else:
        print(f"[FAIL] Sell failed: {resp.text}")

    # 3. Check Gold
    # Initial: 10000
    # Enhance Cost: -100
    # Sell Reward: +120
    # Expected: 10020
    resp = requests.get(f"{BASE_URL}/user/me", headers=headers)
    gold = resp.json()["gold"]
    if gold == 10020:
         print(f"[PASS] Final Gold Correct: {gold}")
    else:
         print(f"[WARN] Final gold mismatch. Got {gold}, expected 10020")

if __name__ == "__main__":
    test_sell()
