import os
import pandas as pd
import pickle
from xgboost import XGBClassifier

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "model", "crop_xgboost_model.json")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "crop_label_encoder.pkl")

# Load model
model = XGBClassifier()
model.load_model(MODEL_PATH)

# Load encoder
with open(ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)


def predict_crop(data):
    input_data = pd.DataFrame([data])

    prediction = model.predict(input_data)
    crop = label_encoder.inverse_transform(prediction)[0]

    return crop