import os
import uuid
import hashlib
from pathlib import Path
from ..config import CATEGORIES
from ..logger import logger

BASE_UPLOADS = Path("uploads")
BASE_UPLOADS.mkdir(parents=True, exist_ok=True)


def _calculate_hash_bytes(contents: bytes):
    sha = hashlib.sha256()
    sha.update(contents)
    return sha.hexdigest()


def save_upload(original_name: str, contents: bytes):
    # determine extension
    ext = Path(original_name).suffix or ""

    # choose category based on extension
    category = "Others"
    for cat, exts in CATEGORIES.items():
        if ext.lower() in exts:
            category = cat
            break

    folder = BASE_UPLOADS / category
    folder.mkdir(parents=True, exist_ok=True)

    uid = uuid.uuid4().hex
    filename = f"{uid}{ext}"
    path = folder / filename

    with open(path, "wb") as f:
        f.write(contents)

    size = path.stat().st_size
    file_hash = _calculate_hash_bytes(contents)

    logger.info(f"Saved upload {original_name} -> {path}")

    return {
        "original_name": original_name,
        "filename": filename,
        "path": str(path),
        "size": size,
        "category": category,
        "file_hash": file_hash,
    }
