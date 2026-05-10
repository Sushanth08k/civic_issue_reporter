import argparse
import random
from pathlib import Path
import shutil

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}


def collect_images(source_dir: Path):
    return [path for path in source_dir.rglob('*') if path.suffix.lower() in IMAGE_EXTENSIONS]


def make_subset(source_dir: Path, dest_dir: Path, max_images: int):
    images = collect_images(source_dir)
    images.sort()
    random.shuffle(images)
    chosen = images[:max_images]
    dest_dir.mkdir(parents=True, exist_ok=True)
    for image_path in chosen:
        target_path = dest_dir / image_path.name
        shutil.copy2(image_path, target_path)
    return len(chosen)


def main():
    parser = argparse.ArgumentParser(description='Prepare limited dataset for CPU training')
    parser.add_argument('--pothole-source', required=True, help='Source folder containing pothole images')
    parser.add_argument('--garbage-source', required=True, help='Source folder containing garbage images')
    parser.add_argument('--target', default='dataset', help='Target folder to write the sampled dataset')
    parser.add_argument('--max-images-per-class', type=int, default=150, help='Maximum images per class')
    args = parser.parse_args()

    target_base = Path(args.target)
    pothole_dest = target_base / 'Pothole'
    garbage_dest = target_base / 'Garbage Dump'

    pothole_count = make_subset(Path(args.pothole_source), pothole_dest, args.max_images_per_class)
    garbage_count = make_subset(Path(args.garbage_source), garbage_dest, args.max_images_per_class)

    print(f'Copied {pothole_count} pothole images to {pothole_dest}')
    print(f'Copied {garbage_count} garbage images to {garbage_dest}')
    print('Dataset preparation complete. Run `python train.py` in ml/ to train on the limited dataset.')


if __name__ == '__main__':
    main()
