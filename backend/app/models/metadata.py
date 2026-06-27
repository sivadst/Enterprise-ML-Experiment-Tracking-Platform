from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import MetadataBase

class User(MetadataBase):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    
class Project(MetadataBase):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    owner = Column(String)
    tags = Column(JSON, default=list) # List of tags
    creation_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Active")
    
    experiments = relationship("Experiment", back_populates="project", cascade="all, delete-orphan")

class Experiment(MetadataBase):
    __tablename__ = "experiments"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    dataset_version = Column(String, nullable=True)
    model_type = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    
    project = relationship("Project", back_populates="experiments")
    runs = relationship("Run", back_populates="experiment", cascade="all, delete-orphan")

class Run(MetadataBase):
    __tablename__ = "runs"
    id = Column(String, primary_key=True, index=True) # UUID string
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    name = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True) # in seconds
    status = Column(String, default="Running") # Running, Completed, Failed, Archived
    model_name = Column(String, nullable=True)
    dataset_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    experiment = relationship("Experiment", back_populates="runs")
    parameters = relationship("Parameter", back_populates="run", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="run", cascade="all, delete-orphan")
    ai_reviews = relationship("AIReview", back_populates="run", cascade="all, delete-orphan")

class Parameter(MetadataBase):
    __tablename__ = "parameters"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, ForeignKey("runs.id"))
    name = Column(String, index=True)
    value = Column(String) # Stored as string for flexibility
    
    run = relationship("Run", back_populates="parameters")

class Metric(MetadataBase):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, ForeignKey("runs.id"))
    name = Column(String, index=True)
    value = Column(Float)
    step = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    run = relationship("Run", back_populates="metrics")

class ModelRegistry(MetadataBase):
    __tablename__ = "model_registry"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    version = Column(String)
    stage = Column(String, default="Development") # Development, Staging, Production, Archived
    run_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DatasetRegistry(MetadataBase):
    __tablename__ = "dataset_registry"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    version = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    file_hash = Column(String, nullable=True)
    tags = Column(JSON, default=list)

class AIReview(MetadataBase):
    __tablename__ = "ai_reviews"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, ForeignKey("runs.id"))
    severity = Column(String) # Info, Warning, Error
    evidence = Column(Text)
    suggested_action = Column(Text)
    confidence = Column(Float)
    summary = Column(Text, nullable=True)
    
    run = relationship("Run", back_populates="ai_reviews")
