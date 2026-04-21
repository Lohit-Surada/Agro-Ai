import os
import django
from django.test import Client
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_ai.settings')
django.setup()

client = Client()
image_path = 'uploads/soil_detect_images/0300310f7c6446b8842be35530f770b7.jpg'

if not os.path.exists(image_path):
    print(f"Error: {image_path} not found")
else:
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    uploaded_file = SimpleUploadedFile('test_image.jpg', image_data, content_type='image/jpeg')
    try:
        response = client.post('/api/soil/detect/', {'image': uploaded_file})
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
    except Exception as e:
        import traceback
        print(f"Error during POST: {e}")
        traceback.print_exc()
