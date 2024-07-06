from scripts.VideoToFrames import convert_video
from scripts.CropFaces import *
from scripts.DetectDeepfake import *
from scripts.DetectArt import *
from scripts.DetectAudio import *
from flask import Flask, request
from flask_cors import CORS

from transformers import pipeline

pipe = pipeline("image-classification", "umm-maybe/AI-image-detector")

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/', methods=['GET'])
def handle_root():
    return 'backend api'


@app.route('/detect_image', methods=['POST'])
def handle_detect_image():
    if 'file' in request.files:
        file = request.files['file']
        file_path = file.filename
        file.save(file_path)
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension in ['jpg', 'jpeg', 'png', 'webp']:
            # checking for faces
            face_array = crop_faces(file_path)
            if (face_array.shape[0] != 0):
                # faces present so do face based detection
                # pil_images = [Image.fromarray(face) for face in face_array]
                predictions = [predict(face) for face in face_array]
                real = [pred['real'] for pred in predictions]
                fake = [pred['fake'] for pred in predictions]
                real_avg = sum(real) / len(real)
                fake_avg = sum(fake) / len(fake)
                print("Face detection")
                print(real_avg, fake_avg)
                # result = predict_face(pil_images)
                return f"% Real: {real_avg * 100}, % Fake: {fake_avg * 100}"
            else:
                # face absent so perfect art based detection
                print("art/no face detection")
                result = predict_art(file_path, pipe)
                print(result)
                return f"% Artificial: {result['artificial'] * 100}, % Real: {result['human'] * 100}"
        else:
            return f'Unsupported file format: {file_extension}'
    else:
        return 'No image data received'


@app.route('/detect_audio', methods=['POST'])
def handle_detect_audio():
    if 'file' in request.files:
        file = request.files['file']
        file_path = file.filename
        # file.save(file_path)
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension in ['wav', 'mp3', 'ogg']:
            audio_result = predict_audio(file_path)
            if audio_result is not None:
                return audio_result
            else:
                return f'Error processing audio file: {file.filename}'
        else:
            return f'Unsupported file format: {file_extension}'
    else:
        return 'No data received'


@app.route('/detect_video', methods=['POST'])
def handle_detect_video():
    if 'file' in request.files:
        file = request.files['file']
        file_path = file.filename
        # file.save(file_path)
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension in ['mp4', 'mkv', 'mov']:
            face_array = convert_video(file_path)
            predictions = predict_face_from_video(face_array)
            real = [pred['real'] for pred in predictions]
            fake = [pred['fake'] for pred in predictions]
            real_avg = sum(real) / len(real)
            fake_avg = sum(fake) / len(fake)
            print(real_avg, fake_avg)
            if len(predictions) != 0:
                return f"% Real: {real_avg * 100}, % Fake: {fake_avg * 100}"
            else:
                return f'Error processing video file: {file.filename}'
        else:
            return f'Unsupported file format: {file_extension}'
    else:
        return 'No data received'


if __name__ == '__main__':
    app.run(debug=True)
