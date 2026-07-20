import requests

url = "http://127.0.0.1:8000/generate-resume-questions"

data = {
    "upload_id": "ef70cb67-da00-4fe2-96fe-6e18c0b9a666",
    "role": "Backend Developer",
    "count": 5
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.text)