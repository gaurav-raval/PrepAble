import requests

# Upload
with open("test_resume.txt", "rb") as f:
    r = requests.post(
        "http://127.0.0.1:8000/upload-resume",
        files={"resume": f}
    )

upload_id = r.json()["upload_id"]

print("UPLOAD:", upload_id)

# Generate questions
r2 = requests.post(
    "http://127.0.0.1:8000/generate-resume-questions",
    json={
        "upload_id": upload_id,
        "role": "Backend Developer",
        "count": 5
    }
)

print(r2.status_code)
print(r2.text)