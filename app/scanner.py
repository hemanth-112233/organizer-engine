import os
from .organizer import organize_file

BASE_DIR = "monitored"

def scan_and_organize():
    organized_files = []

    for filename in os.listdir(BASE_DIR):

        file_path = os.path.join(BASE_DIR, filename)

        if os.path.isfile(file_path):

            result = organize_file(file_path)

            organized_files.append(result)

    return organized_files