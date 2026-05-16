import httpx
import asyncio

BASE_URL = "http://localhost:8080"
TIMEOUT = 30.0  # seconds

async def run_smoke_test():
    print(f"Starting smoke tests against {BASE_URL}...\n")
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=TIMEOUT) as client:
        # State to carry over
        bridge_report_data = None
        bridge_questionnaire_data = None
        
        # Test 1: Generate Reading (Normal Mode)
        print("Test 1: /api/generate-reading (Normal Mode)")
        try:
            payload = {
                "name": "Smoke Test User",
                "birthDate": "1990-05-15",
                "birthTime": "14:30",
                "birthCity": "New York",
                "focusArea": "career progression",
                "mode": "normal"
            }
            resp = await client.post("/api/generate-reading", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                if "readingId" in data and data.get("mode") == "normal":
                    print("  ✅ PASS")
                else:
                    print(f"  ❌ FAIL: Unexpected response format: {data}")
            else:
                print(f"  ❌ FAIL: Status {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"  ❌ FAIL: Exception - {e}")
            
        print()
        
        # Test 2: Generate Reading (Stealth Mode)
        print("Test 2: /api/generate-reading (Stealth Mode)")
        try:
            payload = {
                "name": "Smoke Test Stealth User",
                "birthDate": "1988-10-10",
                "birthCity": "London",
                "focusArea": "feeling stuck in life",
                "mode": "stealth"
            }
            resp = await client.post("/api/generate-reading", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                if "readingId" in data and data.get("mode") == "stealth":
                    print("  ✅ PASS")
                else:
                    print(f"  ❌ FAIL: Unexpected response format: {data}")
            else:
                print(f"  ❌ FAIL: Status {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"  ❌ FAIL: Exception - {e}")
            
        print()
        
        # Test 3: Bridge Generate Report
        print("Test 3: /api/bridge/generate-report")
        try:
            bridge_questionnaire_data = {
                "consistency": "somewhat_consistent",
                "decisionStyle": "analytical",
                "goalClarity": "foggy",
                "currentState": "stuck",
                "stuckDescription": "Just feeling completely paused and unable to move forward."
            }
            resp = await client.post("/api/bridge/generate-report", json=bridge_questionnaire_data)
            if resp.status_code == 200:
                bridge_report_data = resp.json()
                if "coreTheme" in bridge_report_data:
                    print("  ✅ PASS")
                else:
                    print(f"  ❌ FAIL: Unexpected response format: {bridge_report_data}")
            else:
                print(f"  ❌ FAIL: Status {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"  ❌ FAIL: Exception - {e}")
            
        print()
        
        # Test 4: Bridge Chat (Free - question_count = 1)
        print("Test 4: /api/bridge/chat (Free, count=1)")
        try:
            if not bridge_report_data:
                print("  ⚠️ SKIP: Requires Test 3 report data to run")
            else:
                payload = {
                    "message": "Why am I feeling this way?",
                    "questionnaireData": bridge_questionnaire_data,
                    "reportData": bridge_report_data,
                    "chatHistory": [],
                    "questionCount": 1
                }
                resp = await client.post("/api/bridge/chat", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    if "reply" in data and data.get("state") == "bridge_free_chat":
                        print("  ✅ PASS")
                    else:
                        print(f"  ❌ FAIL: Unexpected response format: {data}")
                else:
                    print(f"  ❌ FAIL: Status {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"  ❌ FAIL: Exception - {e}")
            
        print()
        
        # Test 5: Bridge Chat (Paywall - question_count = 3)
        print("Test 5: /api/bridge/chat (Paywall, count=3)")
        try:
            if not bridge_report_data:
                print("  ⚠️ SKIP: Requires Test 3 report data to run")
            else:
                payload = {
                    "message": "Can you give me more specific details?",
                    "questionnaireData": bridge_questionnaire_data,
                    "reportData": bridge_report_data,
                    "chatHistory": [
                        {"role": "user", "content": "Why am I feeling this way?"},
                        {"role": "bridge", "content": "Sample free response."},
                        {"role": "user", "content": "What should I do?"},
                        {"role": "bridge", "content": "Sample another free response."}
                    ],
                    "questionCount": 3
                }
                resp = await client.post("/api/bridge/chat", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    if "reply" in data and data.get("state") == "paywall_reached":
                        print("  ✅ PASS")
                        print(f"  (Paywall Message Received: '{data['reply'][:60]}...')")
                    else:
                        print(f"  ❌ FAIL: Unexpected response format: {data}")
                else:
                    print(f"  ❌ FAIL: Status {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"  ❌ FAIL: Exception - {e}")

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
