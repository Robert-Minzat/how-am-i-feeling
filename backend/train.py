import itertools

import numpy as np
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
x_test, y_test = load_dataset_image(['../dataset/ck+',
                                      '../dataset/kdef/train_kdef',
                                      '../dataset/jaffe',
                                      '../dataset/facesdb_clean'])
# num_samples = emotions.size

# split dataset into train, test and validation
# x_train, x_test, y_train, y_test = train_test_split(faces, emotions, test_size=0.1, shuffle=True, random_state=42)
# x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.1, shuffle=True, random_state=41)

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
# models = []
# models.append(load_model(base_path + '_best_tf-bs8.56-0.83.hdf5'))
# models.append(load_model(base_path + 'tf-bs16.27-0.82.hdf5'))

# models.append(load_model(base_path + 'fer.131-0.61.hdf5'))
# x_test, y_test = load_dataset_image(['../dataset/fer2013clean/test'])
# scores = []
# for model in models:
#     score = model.evaluate(x_test, y_test, batch_size=batch_size)
#     scores.append(score)
# for score in scores:
#     print("*******")
#     print("[INFO] Loss: " + str(score[0]))
#     print("[INFO] Accuracy: " + str(score[1]))















# corelograma
model = load_model(base_path + '_best_tf-bs8.56-0.83.hdf5')

emotions_pred = model.predict(x_test).tolist()
nr = 0

emotions_true = np.argmax(y_test, axis=-1)
pred_true = []
predy = []
# print(emotions_pred)

EMOTIONS = ["furie", "dezgust", "frica", "fericire", "tristete", "uimire",
            "neutru"]

for i in range(len(x_test)):
    pmax = max(emotions_pred[i])
    predy.append(EMOTIONS[emotions_pred[i].index(pmax)])
    pred_true.append(EMOTIONS[emotions_true[i]])

from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt

cm = confusion_matrix(pred_true, predy)
cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
print(cm)
plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
plt.colorbar()
tick_marks = np.arange(len(EMOTIONS))
plt.xticks(tick_marks, EMOTIONS, rotation=45)
plt.yticks(tick_marks, EMOTIONS)
fmt = 'd'
thresh = cm.max() / 2.
for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
    plt.text(j, i, format(round(cm[i, j], 2)),
            horizontalalignment="center",
            color="white" if cm[i, j] > thresh else "black")

plt.ylabel('Emotia adevarata')
plt.xlabel('Emotia prezisa')
plt.tight_layout()
plt.show()