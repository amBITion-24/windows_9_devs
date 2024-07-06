import os
import numpy as np
import librosa
import tensorflow as tf
from pathlib import Path

# Load your pre-trained model


def load_model(model_path):
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Function to preprocess the audio file


def preprocess_audio(filename, sample_rate=22050):
    try:
        y, sr = librosa.load(filename, sr=sample_rate, res_type='kaiser_fast')
        mfcc_features = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfccs_scaled_features = np.mean(mfcc_features.T, axis=0).reshape(1, -1)
        return mfccs_scaled_features
    except Exception as e:
        print(f"Error processing file {filename}: {e}")
        return None

# Function to detect fake audio


def predict_audio(filename, threshold=0.5):
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return

    audio_data = preprocess_audio(filename)
    if audio_data is None:
        print(f"Error in processing audio for file: {filename}")
        return

    # Process the audio file
    audio_model_path = Path("models/audio_detection_model.h5")  # Change this to your model path
    audio_model = load_model(audio_model_path)

    # Ensure the input shape matches what the model expects
    try:
        result_array = audio_model.predict(audio_data)
        result_classes = ["REAL", "FAKE"]  # Ensure this order matches your model output
        print(f"Raw model output: {result_array}")

        # For binary classification, model output might be a single probability
        if result_array.shape[1] == 1:
            result = "FAKE" if result_array[0][0] >= threshold else "REAL"
        else:
            result = result_classes[np.argmax(result_array[0])]

        print(f"Prediction: {result} for file {filename}")
        return result
    except Exception as e:
        print(f"Error predicting file {filename}: {e}")
