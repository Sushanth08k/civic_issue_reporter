# Dataset setup

This folder holds labeled civic issue images for training the model.

For the current prototype, we are using two classes:

- `dataset/Pothole/` — images of potholes in the road
- `dataset/Garbage Dump/` — images of garbage or dump sites

The `Broken Streetlight` class is planned for later once that dataset is available.

The training script `ml/train.py` uses `ImageDataGenerator` to load images from this directory.

Because you are training without GPU support, use a limited subset of images:

- 100–200 images for `Pothole`
- 100–200 images for `Garbage Dump`

If the dataset is too large, create a smaller sample set first and then train on that.

Recommended steps:
1. Download or copy the scraped pothole dataset into `dataset/Pothole/`.
2. Download or copy the garbage dataset images into `dataset/Garbage Dump/`.
3. Keep the number of images per class limited for CPU training.
4. Use the existing `ml/train.py` defaults: `BATCH_SIZE = 8`, `EPOCHS = 5`.

Later, once `Broken Streetlight` images are ready, add a `dataset/Broken Streetlight/` folder and update `CLASS_NAMES` if needed.
