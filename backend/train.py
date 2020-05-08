from keras.callbacks import CSVLogger, EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from keras.preprocessing.image import ImageDataGenerator
from keras.models import load_model

from load_and_process import load_dataset_image, load_dataset_csv
from sklearn.model_selection import train_test_split
from cnn import gen_model, gen_model2

batch_size = 16
num_epochs = 1000
validation_split = 0.2
verbose = 1
input_shape = (48, 48, 1)
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

# create model
model = gen_model()

# load weights from checkpoint
model.load_weights(base_path + "fer.131-0.61.hdf5")

model.compile(optimizer='adam', loss='categorical_crossentropy',
              metrics=['accuracy'])
model.summary()

# callbacks
log_file_path = base_path + '_emotion_training.log'
csv_logger = CSVLogger(log_file_path, append=False)
early_stop = EarlyStopping('val_loss', patience=patience)
reduce_lr = ReduceLROnPlateau('val_loss', factor=0.1, patience=int(patience / 4), verbose=verbose)
trained_models_path = base_path + 'tfck-bs16'
model_names = trained_models_path + '.{epoch:02d}-{val_accuracy:.2f}.hdf5'
model_checkpoint = ModelCheckpoint(model_names, 'val_loss', verbose=verbose, save_best_only=True)
callbacks = [model_checkpoint, csv_logger, early_stop, reduce_lr]


# load dataset
faces, emotions = load_dataset_image(['../dataset/ck+',
                                      '../dataset/kdef/train_kdef',
                                      '../dataset/jaffe',
                                      '../dataset/facesdb_clean'])
# num_samples = emotions.size

# split dataset into train, test and validation
x_train, x_test, y_train, y_test = train_test_split(faces, emotions, test_size=0.1, shuffle=True, random_state=42)
x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.1, shuffle=True, random_state=41)

# x_train, y_train = load_dataset_image(['../dataset/fer2013clean/train'])
# x_val, y_val = load_dataset_image(['../dataset/fer2013clean/validation'])
#
model.fit_generator(data_generator.flow(x_train, y_train, batch_size),
                    steps_per_epoch=len(x_train) / batch_size,
                    epochs=num_epochs,
                    verbose=verbose,
                    callbacks=callbacks,
                    validation_data=(x_val, y_val))

# check loss and accuracy after model has been trained
# model = load_model(base_path + '_best_tf-bs8.56-0.83.hdf5')
# x_test, y_test = load_dataset_image(['../dataset/fer2013clean/test'])
scores = model.evaluate(x_test, y_test, batch_size=batch_size)
print("[INFO] Loss: " + str(scores[0]))
print("[INFO] Accuracy: " + str(scores[1]))
