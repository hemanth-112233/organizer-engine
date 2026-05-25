from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ..services.storage import save_upload
from ..database import SessionLocal
from ..models import FileRecord
from ..logger import logger

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Basic validation
    MAX_SIZE = 50 * 1024 * 1024  # 50MB

    contents = await file.read()
    size = len(contents)

    if size == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    if size > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    try:
        stored = save_upload(file.filename, contents)

        # persist record
        db = SessionLocal()
        record = FileRecord(
            name=stored["original_name"],
            category=stored.get("category", "Uncategorized"),
            path=stored["path"],
            size=stored["size"],
            file_hash=stored.get("file_hash", "")
        )

        db.add(record)
        db.commit()
        db.close()

        logger.info(f"Uploaded file saved: {stored['filename']}")

        return JSONResponse({"message": "uploaded", "file": stored})

    except Exception as e:
        logger.exception("Upload error")
        raise HTTPException(status_code=500, detail=str(e))
