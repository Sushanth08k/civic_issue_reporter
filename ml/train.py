import tensorflow as tf
from pathlib import Path
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator

BASE_MODEL_NAME = 'MobileNetV2'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 8
EPOCHS = 5
CLASS_NAMES = ['normal', 'potholes']
DATA_DIR = 'dataset/Pothole'
MODEL_OUTPUT = '../backend/models/civic_issue_classifier.keras'


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
        image_files = list(cls_dir.rglob('*'))
        image_files = [p for p in image_files if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}]
        if not image_files:
            empty.append(str(cls_dir))

    if missing or empty:
        msg = []
        if missing:
            msg.append('Missing class directories: ' + ', '.join(missing))
        if empty:
            msg.append('Class directories contain no images: ' + ', '.join(empty))
        raise ValueError('\n'.join(msg))


def create_training_pipeline():
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2,
    )

    train_generator = train_datagen.flow_from_directory(
        DATA_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
    )
    validation_generator = train_datagen.flow_from_directory(
        DATA_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
    )

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

    return model, train_generator, validation_generator


def main():
    validate_dataset()
    model, train_generator, validation_generator = create_training_pipeline()
    history = model.fit(
        train_generator,
        validation_data=validation_generator,
        epochs=EPOCHS,
    )
    print('Training finished. Saving model to', MODEL_OUTPUT)
    model.save(MODEL_OUTPUT)

    print('Best validation accuracy:', max(history.history['val_accuracy']))


if __name__ == '__main__':
    main()
