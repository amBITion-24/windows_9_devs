from scripts.CropFaces import *
from scripts.DetectDeepfake import *
from scripts.DetectArt import *
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
    print(request.files)
    if 'file' in request.files:
            file = request.files['file']
            file_path = file.filename
            file.save(file_path)
            file_extension = file.filename.split('.')[-1].lower()
            if file_extension in ['jpg', 'jpeg', 'png','webp']:
                #checking for faces
                face_array = crop_faces(file_path)
                if (face_array.shape[0] != 0):
                    #faces present so do face based detection
                    print("Face detection")
                else:
                    #face absent so perfect art based detection
                    print("art/no face detection")
                    result = predict_art(file_path,pipe)
                print(result)
                return "in testing phase"
            else:
                return f'Unsupported file format: {file_extension}'
    else:
        return 'No image data received'


if __name__ == '__main__':
    app.run()