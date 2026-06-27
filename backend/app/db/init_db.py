import os
from sqlalchemy import create_engine
from app.db.database import MetadataBase, ArtifactsBase, METADATA_DB_URL, ARTIFACTS_DB_URL
from app.models.metadata import *  # Import all metadata models
from app.models.artifacts import * # Import all artifact models

def init_db():
    print("Initializing Metadata Database...")
    metadata_engine = create_engine(METADATA_DB_URL)
    MetadataBase.metadata.create_all(bind=metadata_engine)
    
    print("Initializing Artifacts Database...")
    artifacts_engine = create_engine(ARTIFACTS_DB_URL)
    ArtifactsBase.metadata.create_all(bind=artifacts_engine)
    
    print("Databases initialized successfully.")

if __name__ == "__main__":
    init_db()
