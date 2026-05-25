import os
import shutil
import hashlib
import time

from .logger import logger
from .config import CATEGORIES

BASE_DIR = "monitored"


# -----------------------------
# SAFE HASH FUNCTION
# -----------------------------
def calculate_hash(file_path):

    for i in range(3):
        try:
            sha256 = hashlib.sha256()

            with open(file_path, "rb") as f:
                while chunk := f.read(4096):
                    sha256.update(chunk)

            return sha256.hexdigest()

        except PermissionError:
            print(f"Hash locked, retrying ({i+1}/3)")
            time.sleep(1)

    raise Exception("File still locked for hashing")


# -----------------------------
# CATEGORY LOGIC
# -----------------------------
def get_category(extension):

    for category, extensions in CATEGORIES.items():
        if extension.lower() in extensions:
            return category

    return "Others"


# -----------------------------
# MAIN ORGANIZER FUNCTION
# -----------------------------
def organize_file(file_path):

    filename = os.path.basename(file_path)
    extension = os.path.splitext(filename)[1]

    category = get_category(extension)

    category_folder = os.path.join(BASE_DIR, category)
    os.makedirs(category_folder, exist_ok=True)

    destination = os.path.join(category_folder, filename)

    logger.info(f"Moving file: {filename} -> {category}")

    # -----------------------------
    # SAFE FILE ACCESS BLOCK
    # -----------------------------
    time.sleep(1)  # allow OS to finish writing file

    file_size = None
    file_hash = None

    for i in range(3):
        try:
            file_size = os.path.getsize(file_path)
            file_hash = calculate_hash(file_path)
            break

        except PermissionError:
            print(f"File locked (size/hash), retrying ({i+1}/3)")
            time.sleep(1)

    if file_size is None or file_hash is None:
        raise Exception("File still locked after retries")

    # -----------------------------
    # MOVE FILE
    # -----------------------------
    shutil.move(file_path, destination)

    return {
        "name": filename,
        "category": category,
        "path": destination,
        "size": file_size,
        "file_hash": file_hash
    }