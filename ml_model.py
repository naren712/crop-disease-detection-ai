import os
import tensorflow as tf
import numpy as np
from PIL import Image

from .disease_info import DISEASE_INFO

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'best_model.h5')

model = tf.keras.models.load_model(MODEL_PATH)


CLASS_NAMES = [
    "apple__apple_scab",
    "apple__black_rot",
    "apple_healthy", 
    "corn__cercospora_leaf_spot_gray_leaf_spot", 
    "corn__common_rust", 
    "corn__healthy", 
    "grape__black_rot", 
    "grape__leaf_blight", 
    "peach__healthy", 
    "peach_bacterial_spot", 
    "potato__early_blight", 
    "potato__healthy", 
    "potato__late", 
    "tomato__bacterial_spot", 
    "tomato__early_blight", 
    "tomato__healthy", 
    "tomato__late_blight", 
    "tomato__leaf_mold"
]

def predict_image(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize((256, 256))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)


    prediction = model.predict(img_array)
    print("RAW PREDICTION:",prediction)
    class_index = np.argmax(prediction)
    confidence = float(np.max(prediction))

    predicted_class = CLASS_NAMES[class_index]# clean name
    clean_name = predicted_class.replace("__", " ").replace("_", " ").title() #get solution & prevention
    disease_info = DISEASE_INFO.get(predicted_class, {})


    print("Predicted index:", class_index)
    print("Prediction array:", prediction)
    
    print("Prediction shape:", prediction.shape)

    print("Model output shape:", prediction.shape)
    
    return {
        "label": predicted_class,
        "prediction": clean_name,
        "confidence": confidence,
        "solution": disease_info.get("solution", []),
        "prevention": disease_info.get("prevention", [])
    }
