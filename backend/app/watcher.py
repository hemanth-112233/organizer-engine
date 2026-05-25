from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time

from .organizer import organize_file
from .database import SessionLocal
from .models import FileRecord


class WatcherHandler(FileSystemEventHandler):

    def on_created(self, event):

        if event.is_directory:
            return

        print("EVENT FIRED:", event.src_path)

        # wait for Windows to finish writing file
        time.sleep(1)

        # retry logic
        for i in range(3):

            try:

                result = organize_file(event.src_path)

                db = SessionLocal()

                file_record = FileRecord(
                    name=result["name"],
                    category=result["category"],
                    path=result["path"],
                    size=result["size"],
                    file_hash=result["file_hash"]
                )

                db.add(file_record)
                db.commit()
                db.close()

                print(f"Organized: {result['name']}")
                break

            except PermissionError:
                print(f"File locked, retrying ({i+1}/3)")
                time.sleep(1)

            except Exception as e:
                print("ERROR:", e)
                break


def start_watcher(path):

    observer = Observer()

    observer.schedule(
        WatcherHandler(),
        path=path,
        recursive=False
    )

    observer.start()

    print("Watching folder...")

    try:
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        observer.stop()

    observer.join()