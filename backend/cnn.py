from keras.layers import Activation, Dropout, Conv2D, Dense
from keras.layers import AveragePooling2D, BatchNormalization
from keras.layers import GlobalAveragePooling2D
from keras.models import Sequential
from keras.layers import Flatten
from keras.models import Model
from keras.layers import Input
from keras.layers import MaxPooling2D
from keras.regularizers import l2

input_shape = (64, 64, 1)


def gen_model():
    model = Sequential()

    model.add(Conv2D(32, kernel_size=(2, 2), input_shape=input_shape, padding='same', kernel_regularizer=l2(0.01)))
    model.add(Activation('relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2), padding='same'))
    model.add(Dropout(0.25))

    model.add(Conv2D(64, kernel_size=(2, 2), padding='same'))
    model.add(Activation('relu'))
    model.add(BatchNormalization())
    # model.add(Conv2D(64, kernel_size=(2, 2), padding='same'))
    # model.add(Activation('relu'))
    # model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2), padding='same'))
    model.add(Dropout(0.25))

    model.add(Conv2D(128, kernel_size=(2, 2), padding='same'))
    model.add(Activation('relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2), padding='same'))
    model.add(Dropout(0.25))

    model.add(Conv2D(256, kernel_size=(2, 2), padding='same'))
    model.add(Activation('relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2), padding='same'))
    model.add(Dropout(0.25))

    model.add(Flatten())

    model.add(Dense(4096, activation='relu'))
    model.add(Dropout(0.5))
    # model.add(Dense(1024, activation='relu'))
    # model.add(Dropout(0.5))
    # model.add(Dense(256, activation='relu'))
    # model.add(Dropout(0.4))
    # model.add(Dense(128, activation='relu'))
    # model.add(Dropout(0.4))
    # model.add(Dense(64, activation='relu'))
    # model.add(Dropout(0.4))

    model.add(Dense(7, activation='softmax'))

    model.summary()

    return model
