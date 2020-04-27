from keras.callbacks import CSVLogger, EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from keras.preprocessing.image import ImageDataGenerator
from keras.utils import to_categorical
from pandas import np

from load_and_process import load_dataset
from sklearn.model_selection import train_test_split
from cnn import gen_model

batch_size = 16
num_epochs = 200
input_shape = (64, 64, 1)
validation_split = 0.2
verbose = 1
num_labels = 7
patience = 50

base_path = 'models/'

data_generator = ImageDataGenerator(
    featurewise_center=False,
    featurewise_std_normalization=False,
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=.1,
    horizontal_flip=True)

model = gen_model()
model.compile(optimizer='adam', loss='categorical_crossentropy',
              metrics=['accuracy'])
model.summary()

# callbacks
log_file_path = base_path + '_emotion_training.log'
csv_logger = CSVLogger(log_file_path, append=False)
early_stop = EarlyStopping('val_loss', patience=patience)
reduce_lr = ReduceLROnPlateau('val_loss', factor=0.1, patience=int(patience / 4), verbose=verbose)
trained_models_path = base_path + 'cnn_model'
model_names = trained_models_path + '.{epoch:02d}-{val_accuracy:.2f}.hdf5'
model_checkpoint = ModelCheckpoint(model_names, 'val_loss', verbose=verbose, save_best_only=True)
callbacks = [model_checkpoint, csv_logger, early_stop, reduce_lr]

# loading dataset
faces, emotions = load_dataset()
num_samples = emotions.size
num_classes = 7
# convert emotions to matrix representation
emotions = to_categorical(emotions)

x_train, x_test, y_train, y_test = train_test_split(faces, emotions, test_size=0.2, shuffle=True)
model.fit_generator(data_generator.flow(x_train, y_train, batch_size),
                    steps_per_epoch=len(x_train) / batch_size,
                    epochs=num_epochs,
                    verbose=verbose,
                    callbacks=callbacks,
                    validation_data=(x_test, y_test))
