import os
import pickle

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "model", "crop_xgboost_model.json")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "crop_label_encoder.pkl")

_model = None
_label_encoder = None


def _load_crop_dependencies():
    global _model, _label_encoder

    if _model is not None and _label_encoder is not None:
        return _model, _label_encoder

    import pandas as pd
    from xgboost import XGBClassifier

    model = XGBClassifier()
    model.load_model(MODEL_PATH)

    with open(ENCODER_PATH, "rb") as file_obj:
        label_encoder = pickle.load(file_obj)

    _model = model
    _label_encoder = label_encoder
    return _model, _label_encoder


def predict_crop(data):
    import pandas as pd

    model, label_encoder = _load_crop_dependencies()
    input_data = pd.DataFrame([data])

    prediction = model.predict(input_data)
    crop = label_encoder.inverse_transform(prediction)[0]

    return crop