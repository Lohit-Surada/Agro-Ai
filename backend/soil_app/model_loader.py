import tensorflow as tf
import os

# Resolve path relative to the backend root (one level up from this file's directory)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(_BASE_DIR, "models", "soil_model_compressed.tflite")


class TFLiteSoilModel:
    def __init__(self, model_path):
        self.interpreter = tf.lite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()[0]
        self.output_details = self.interpreter.get_output_details()[0]

    def predict(self, input_batch):
        input_data = tf.convert_to_tensor(input_batch).numpy()

        expected_dtype = self.input_details["dtype"]
        if input_data.dtype != expected_dtype:
            input_data = input_data.astype(expected_dtype)

        expected_shape = tuple(self.input_details["shape"])
        if len(expected_shape) == len(input_data.shape):
            adjusted_shape = list(expected_shape)
            for idx, dim in enumerate(adjusted_shape):
                if dim == -1:
                    adjusted_shape[idx] = input_data.shape[idx]
            expected_shape = tuple(adjusted_shape)

        if input_data.shape != expected_shape:
            raise ValueError(
                f"Input shape mismatch. Expected {expected_shape}, got {input_data.shape}"
            )

        self.interpreter.set_tensor(self.input_details["index"], input_data)
        self.interpreter.invoke()
        output = self.interpreter.get_tensor(self.output_details["index"])
        return output

# attempt to load the model, but continue even if it's missing
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = TFLiteSoilModel(MODEL_PATH)
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