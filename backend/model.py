import io
import numpy as np
import tensorflow as tf
import cv2

CLASS_NAMES = ['Pothole', 'Garbage Dump']
MODEL_PATH = 'models/civic_issue_classifier.keras'


def load_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print('Loaded model from', MODEL_PATH)
        return model
    except Exception as exc:
        print('Warning: could not load saved model:', exc)
        print('Falling back to a stub classifier. Train the model in ml/train.py to enable real inference.')
        return None


def preprocess_image(image_bytes):
    data = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError('Unable to decode image data')
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (224, 224))
    image = image.astype('float32') / 255.0
    return np.expand_dims(image, axis=0)


model = load_model()


def predict_issue(image_bytes):
    if model is not None:
        processed = preprocess_image(image_bytes)
        logits = model.predict(processed)
        index = int(np.argmax(logits, axis=-1)[0])
        return CLASS_NAMES[index]

    # Fallback stub classifier for development
    processed = preprocess_image(image_bytes)
    mean_brightness = float(np.mean(processed))
    if mean_brightness < 0.4:
        return 'Pothole'
    if mean_brightness > 0.7:
        return 'Garbage Dump'
    return 'Pothole'
