from fastapi import FastAPI
from sqlalchemy import func
import threading

from .database import engine, SessionLocal
from .models import Base, FileRecord
from .scanner import scan_and_organize
from .watcher import start_watcher
from fastapi.middleware.cors import CORSMiddleware

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STARTUP EVENT ----------------
@app.on_event("startup")
def startup_event():
    watcher_thread = threading.Thread(
        target=start_watcher,
        args=("monitored",),
        daemon=True
    )
    watcher_thread.start()

# ---------------- ROUTES ----------------
@app.get("/")
def home():
    return {"message": "Organizer Engine Running"}

@app.post("/scan")
async def scan_files():

    db = SessionLocal()

    results = scan_and_organize()

    for item in results:
        file_record = FileRecord(
            name=item["name"],
            category=item["category"],
            path=item["path"],
            size=item["size"],
            file_hash=item["file_hash"]
        )

        db.add(file_record)

    db.commit()

    return {
        "message": "Files organized",
        "files": results
    }

@app.get("/files")
def get_files():

    db = SessionLocal()
    return db.query(FileRecord).all()

@app.get("/stats")
def get_stats():

    db = SessionLocal()

    files = db.query(FileRecord).all()

    stats = {}

    for file in files:
        stats[file.category] = stats.get(file.category, 0) + 1

    return stats

@app.get("/duplicates")
def duplicates():

    db = SessionLocal()

    duplicate_hashes = (
        db.query(
            FileRecord.file_hash,
            func.count(FileRecord.file_hash)
        )
        .group_by(FileRecord.file_hash)
        .having(func.count(FileRecord.file_hash) > 1)
        .all()
    )

    duplicates = []

    for file_hash, count in duplicate_hashes:
        files = (
            db.query(FileRecord)
            .filter(FileRecord.file_hash == file_hash)
            .all()
        )

        duplicates.append(files)

    return duplicates