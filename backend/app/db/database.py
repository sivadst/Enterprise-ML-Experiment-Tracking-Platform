from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

METADATA_DB_URL = os.getenv("METADATA_DB_URL", "sqlite:///./metadata.db")
ARTIFACTS_DB_URL = os.getenv("ARTIFACTS_DB_URL", "sqlite:///./artifacts.db")

metadata_engine = create_engine(METADATA_DB_URL, connect_args={"check_same_thread": False})
MetadataSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=metadata_engine)
MetadataBase = declarative_base()

artifacts_engine = create_engine(ARTIFACTS_DB_URL, connect_args={"check_same_thread": False})
ArtifactsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=artifacts_engine)
ArtifactsBase = declarative_base()

def get_metadata_db():
    db = MetadataSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_artifacts_db():
    db = ArtifactsSessionLocal()
    try:
        yield db
    finally:
        db.close()
