from keras.preprocessing.image import img_to_array
import imutils
import cv2
import numpy as np
import os

# emotions = {
#     'anger': 0,
#     'disgust': 1,
#     'fear': 2,
#     'happiness': 3,
#     'sadness': 4,
#     'surprise': 5,
#     'neutral': 6
# }

# face detection model
face_detection = cv2.CascadeClassifier('haarcascade_files/haarcascade_frontalface_default.xml')


def process_facesdb_dataset():
    dir_path = '../dataset/facesdb'
    output_path = '../dataset/facesdb_clean'
    emotions = {
        '0': 'neutral',
        '1': 'happiness',
        '2': 'sadness',
        '3': 'surprise',
        '4': 'anger',
        '5': 'disgust',
        '6': 'fear'
    }

    for subject in os.listdir(dir_path):
        for subject_face in os.listdir(dir_path + '/' + subject + '/bmp/'):
            emotion = subject_face[subject_face.find('-') + 2:subject_face.find('-') + 3]
            # load image in grayscale
            image = cv2.imread(dir_path + '/' + subject + '/bmp/' + subject_face)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = face_detection.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30),
                                                    flags=cv2.CASCADE_SCALE_IMAGE)
            print(faces)
            if len(faces) > 0:
                for (x, y, w, h) in faces:
                    r = max(w, h) / 2
                    centerx = x + w / 2
                    centery = y + h / 2
                    nx = int(centerx - r)
                    ny = int(centery - r)
                    nr = int(r * 2)

                    crop = gray[ny:ny + nr, nx:nx + nr]
                    crop = cv2.resize(crop, (48, 48))

                    cv2.imwrite(os.path.join(output_path, emotions[emotion], subject + '.png'), crop)

# process_facesdb_dataset()