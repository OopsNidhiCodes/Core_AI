"""
Simple API test script
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_tokenize():
    """Test tokenization endpoint"""
    print("\n🔍 Testing /tokenize endpoint...")
    try:
        data = {
            "text": "Hello world, how are you?",
            "model": "bert"
        }
        response = requests.post(f"{BASE_URL}/tokenize", json=data)
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"📦 Tokens: {result.get('tokens', [])[:5]}...")
        print(f"📊 Token count: {result.get('token_count', 0)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_chat():
    """Test chat endpoint"""
    print("\n🔍 Testing /chat endpoint...")
    try:
        data = {
            "message": "What is tokenization?"
        }
        response = requests.post(f"{BASE_URL}/chat", json=data)
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"💬 Response: {result.get('response', '')[:100]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_models():
    """Test models endpoint"""
    print("\n🔍 Testing /models endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/models")
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"🤖 Available models: {result.get('available_models', [])}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*50)
    print("CoreAI Backend API Tests")
    print("="*50)
    
    print("\n⚠️  Make sure the server is running on http://localhost:8000")
    print("   Start it with: python run.py\n")
    
    input("Press Enter to start tests...")
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Tokenization", test_tokenize()))
    results.append(("Chat", test_chat()))
    results.append(("Models", test_models()))
    
    # Summary
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{name:.<30} {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
    
    if total_passed == len(results):
        print("\n🎉 All tests passed! Your API is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()