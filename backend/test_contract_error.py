import requests
import json
import sys

# Local Backend URL
BASE_URL = "http://localhost:8080/api/v1"

def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={"nickname": "test"})
        if response.status_code == 200:
            return response.json()["token"]
        else:
            print(f"Login failed: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

def generate_contracts(token):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.post(f"{BASE_URL}/contract/available/generate", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error calling generate: {e}")

if __name__ == "__main__":
    token = login()
    generate_contracts(token)
