import cv2
import numpy as np
import os


dataset_path = '../dataset/_train'
image_size = (64, 64)
emotions = {
    'anger': 0,
    'disgust': 1,
    'fear': 2,
    'happiness': 3,
    'sadness': 4,
    'surprise': 5,
    'neutral': 6
}

def load_dataset():
    print("[INFO] loading images...")
    data = []
    labels = []

    # loop over the emotion directories
    for emotionDirectory in os.listdir(dataset_path):
        for image in os.listdir(dataset_path + '/' + emotionDirectory):
            # load image in grayscale mode
            img = cv2.imread(dataset_path + '/' + emotionDirectory + '/' + image, 0)
            img = cv2.resize(img, image_size)
            data.append(img)
            labels.append(emotions[emotionDirectory])

    data = np.array(data).astype('float32')
    data = np.expand_dims(data, -1)
    labels = np.array(labels)
    print("[INFO] done loading images...")
    return data, labels