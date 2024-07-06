import cv2 as cv
from PIL import Image

def art_classifier(image,pipe):
    outputs = pipe(image)
    results = {}
    for result in outputs:
        results[result['label']] = result['score']
    return results

def predict_art(path_img,pipe):
    img_arr = cv.imread(path_img)
    img = Image.fromarray(img_arr)
    res = art_classifier(img,pipe)
    return res