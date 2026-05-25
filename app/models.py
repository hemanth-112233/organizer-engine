from sqlalchemy import Column, Integer, String
from .database import Base

class FileRecord(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    category = Column(String)
    path = Column(String)

    size = Column(Integer)
    file_hash = Column(String)