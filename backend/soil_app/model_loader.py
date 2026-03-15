import os

# Resolve path relative to the backend root (one level up from this file's directory)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(_BASE_DIR, "models", "best_soil_model.keras")

_model = None
_model_load_attempted = False


def get_soil_model():
    global _model, _model_load_attempted

    if _model_load_attempted:
        return _model

    _model_load_attempted = True
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: soil model not found at {MODEL_PATH}, predictions disabled")
        return None

    try:
        os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
        os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
        import tensorflow as tf

        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as exc:
        print(f"Warning: failed to load soil model: {exc}")
        _model = None

    return _model

# Classes are ordered alphabetically to match how Keras flow_from_directory
# assigned indices during training (sorted by folder name A→Z).
soil_classes = [
    "Alluvial Soil",   # 0
    "Arid Soil",       # 1
    "Black Soil",      # 2
    "Clay Soil",       # 3
    "Laterite Soil",   # 4
    "Mountain Soil",   # 5
    "Red Soil",        # 6
    "Yellow Soil",     # 7
]