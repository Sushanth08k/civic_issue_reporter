import random
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models

BASE_MODEL_NAME = 'MobileNetV2'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 8
EPOCHS = 5
CLASS_NAMES = ['Pothole', 'Garbage Dump']
DATA_DIR = 'dataset'
MODEL_OUTPUT = '../backend/models/civic_issue_classifier.keras'


def collect_image_paths(root_dir, class_names):
    paths = []
    labels = []
    root = Path(root_dir)

    for label_index, class_name in enumerate(class_names):
        class_dir = root / class_name
        if not class_dir.exists():
            continue
        for image_path in class_dir.rglob('*'):
            if image_path.is_file() and image_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}:
                paths.append(str(image_path))
                labels.append(label_index)

    return paths, labels


def validate_dataset():
    root = Path(DATA_DIR)
    if not root.exists():
        raise FileNotFoundError(f"Dataset directory not found: {root.resolve()}")

    missing = []
    empty = []
    for cls in CLASS_NAMES:
        cls_dir = root / cls
        if not cls_dir.exists():
            missing.append(str(cls_dir))
            continue
        image_files = [p for p in cls_dir.rglob('*') if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}]
        if not image_files:
            empty.append(str(cls_dir))

    if missing or empty:
        msg = []
        if missing:
            msg.append('Missing class directories: ' + ', '.join(missing))
        if empty:
            msg.append('Class directories contain no images: ' + ', '.join(empty))
        raise ValueError('\n'.join(msg))


def decode_image(image_path):
    image = tf.io.read_file(image_path)
    image = tf.io.decode_image(image, channels=3, expand_animations=False)
    image = tf.image.resize(image, IMAGE_SIZE)
    image = tf.cast(image, tf.float32) / 255.0
    return image


def parse_path(path, label):
    image = decode_image(path)
    label = tf.one_hot(label, len(CLASS_NAMES))
    return image, label


def build_dataset(image_paths, labels, batch_size, shuffle=True):
    ds = tf.data.Dataset.from_tensor_slices((image_paths, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=len(image_paths), reshuffle_each_iteration=True)
    ds = ds.map(parse_path, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds


def create_training_pipeline():
    image_paths, labels = collect_image_paths(DATA_DIR, CLASS_NAMES)
    data = list(zip(image_paths, labels))
    random.shuffle(data)

    split_index = int(len(data) * 0.8)
    train_data = data[:split_index]
    val_data = data[split_index:]

    train_paths, train_labels = zip(*train_data)
    val_paths, val_labels = zip(*val_data)

    train_dataset = build_dataset(list(train_paths), list(train_labels), BATCH_SIZE, shuffle=True)
    validation_dataset = build_dataset(list(val_paths), list(val_labels), BATCH_SIZE, shuffle=False)

    backbone = tf.keras.applications.MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights='imagenet',
    )
    backbone.trainable = False

    model = models.Sequential([
        backbone,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(len(CLASS_NAMES), activation='softmax'),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    return model, train_dataset, validation_dataset


def main():
    validate_dataset()
    model, train_dataset, validation_dataset = create_training_pipeline()
    history = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS,
    )
    print('Training finished. Saving model to', MODEL_OUTPUT)
    model.save(MODEL_OUTPUT)

    print('Best validation accuracy:', max(history.history['val_accuracy']))


if __name__ == '__main__':
    main()
