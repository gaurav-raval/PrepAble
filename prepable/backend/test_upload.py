import requests

url = "http://127.0.0.1:8000/upload-resume"

with open("test_resume.txt", "rb") as f:
    files = {
        "resume": f
    }

    response = requests.post(url, files=files)

print(response.status_code)
print(response.text)