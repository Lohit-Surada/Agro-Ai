import tensorflow as tf
import os

# Resolve path relative to the backend root (one level up from this file's directory)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(_BASE_DIR, "models", "best_soil_model.keras")

# attempt to load the model, but continue even if it's missing
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as exc:
        # print to console so developer sees problem
        print(f"Warning: failed to load soil model: {exc}")
else:
    print(f"Warning: soil model not found at {MODEL_PATH}, predictions disabled")

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