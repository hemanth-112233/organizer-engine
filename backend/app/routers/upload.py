from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ..services.storage import save_upload
from ..database import SessionLocal
from ..models import FileRecord
from ..logger import logger

router = APIRouter()


@router.post("/upload")
async def upload_file(files: List[UploadFile] = File(...)):
    # Basic per-file validation
    MAX_SIZE = 50 * 1024 * 1024  # 50MB

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files allowed")

    stored_files = []

    try:
        db = SessionLocal()

        for file in files:
            contents = await file.read()
            size = len(contents)

            if size == 0:
                raise HTTPException(status_code=400, detail=f"Empty file: {file.filename}")

            if size > MAX_SIZE:
                raise HTTPException(status_code=413, detail=f"File too large: {file.filename}")

            stored = save_upload(file.filename, contents)

            record = FileRecord(
                name=stored["original_name"],
                category=stored.get("category", "Uncategorized"),
                path=stored["path"],
                size=stored["size"],
                file_hash=stored.get("file_hash", "")
            )

            db.add(record)
            stored_files.append(stored)

        db.commit()
        db.close()

        for s in stored_files:
            logger.info(f"Uploaded file saved: {s['filename']}")

        return JSONResponse({"message": "uploaded", "files": stored_files})

    except HTTPException:
        # re-raise validation HTTP exceptions
        raise
    except Exception as e:
        logger.exception("Upload error")
        raise HTTPException(status_code=500, detail=str(e))
