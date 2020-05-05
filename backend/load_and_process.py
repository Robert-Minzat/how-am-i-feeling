import cv2
import numpy as np
import os
from keras.utils import to_categorical

emotions = {
    'anger': 0,
    'disgust': 1,
    'fear': 2,
    'happiness': 3,
    'sadness': 4,
    'surprise': 5,
    'neutral': 6
}


def load_dataset_image(dataset_paths, image_size=(48, 48)):
    print("[INFO] loading images...")
    data = []
    labels = []

    # loop over the emotion directories
    for path in dataset_paths:
        print("[INFO] loading from " + os.path.split(path)[1] + '...')
        for emotionDirectory in os.listdir(path):
            for image in os.listdir(path + '/' + emotionDirectory):
                # load image
                img = cv2.imread(path + '/' + emotionDirectory + '/' + image)
                # resize and turn to grayscale
                img = cv2.resize(img, image_size)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                data.append(img)
                labels.append(emotions[emotionDirectory])
        print("[INFO] done loading from " + os.path.split(path)[1] + '...')

    data = np.array(data).astype('float32')
    # normalize images
    data = data / 255.0
    # expand the dimension of channels
    data = np.expand_dims(data, -1)
    # data -= np.mean(data, axis=0)
    # data /= np.std(data, axis=0)

    labels = np.array(labels)
    # convert emotions to matrix representation
    labels = to_categorical(labels)
    print("[INFO] done loading images...")
    return data, labels

def load_dataset_csv(dataset_paths, image_size=(48,48)):
    print("[INFO] loading images...")
    data = []
    labels = []
# load_dataset()
