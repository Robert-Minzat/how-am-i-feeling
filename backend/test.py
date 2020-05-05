from load_and_process import load_dataset_image
from keras.models import load_model
model = load_model( 'models/_best_tf-bs8.56-0.83.hdf5')
x_test, y_test = load_dataset_image(['../dataset/fer2013clean/test'])
scores = model.evaluate(x_test, y_test, batch_size=8)
print("[INFO] Loss: " + str(scores[0]))
print("[INFO] Accuracy: " + str(scores[1]))
