from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.db.database import ArtifactsBase

class ArtifactMetadata(ArtifactsBase):
    __tablename__ = "artifacts"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, index=True) # References metadata.db runs.id
    filename = Column(String)
    file_path = Column(String) # Local path like storage/artifacts/...
    size = Column(Integer) # bytes
    upload_time = Column(DateTime, default=datetime.utcnow)
    version = Column(String, default="v1")
    mime_type = Column(String, nullable=True)
