import numpy as np
from PIL import Image

def preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.asarray(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # normalize to [0, 1] range expected by the model
    return img_array