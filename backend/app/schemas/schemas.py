from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    owner: str
    tags: List[str] = []
    status: str = "Active"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    creation_date: datetime

    class Config:
        from_attributes = True

class ExperimentBase(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_version: Optional[str] = None
    model_type: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []

class ExperimentCreate(ExperimentBase):
    project_id: int

class ExperimentResponse(ExperimentBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class RunBase(BaseModel):
    id: str
    name: Optional[str] = None
    status: str = "Running"
    model_name: Optional[str] = None
    dataset_name: Optional[str] = None
    notes: Optional[str] = None

class RunCreate(RunBase):
    experiment_id: int

class RunResponse(RunBase):
    experiment_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None

    class Config:
        from_attributes = True

class ParameterBase(BaseModel):
    name: str
    value: str

class ParameterCreate(ParameterBase):
    run_id: str

class ParameterResponse(ParameterBase):
    id: int
    run_id: str

    class Config:
        from_attributes = True

class MetricBase(BaseModel):
    name: str
    value: float
    step: int = 0

class MetricCreate(MetricBase):
    run_id: str

class MetricResponse(MetricBase):
    id: int
    run_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ModelRegistryBase(BaseModel):
    name: str
    version: str
    stage: str = "Development"
    run_id: Optional[str] = None

class ModelRegistryCreate(ModelRegistryBase):
    pass

class ModelRegistryResponse(ModelRegistryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetRegistryBase(BaseModel):
    name: str
    version: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    file_hash: Optional[str] = None
    tags: List[str] = []

class DatasetRegistryCreate(DatasetRegistryBase):
    pass

class DatasetRegistryResponse(DatasetRegistryBase):
    id: int
    upload_date: datetime

    class Config:
        from_attributes = True

class AIReviewBase(BaseModel):
    severity: str
    evidence: str
    suggested_action: str
    confidence: float
    summary: Optional[str] = None

class AIReviewCreate(AIReviewBase):
    run_id: str

class AIReviewResponse(AIReviewBase):
    id: int
    run_id: str

    class Config:
        from_attributes = True

class ArtifactResponse(BaseModel):
    id: int
    run_id: str
    filename: str
    size: int
    upload_time: datetime
    version: str
    mime_type: Optional[str] = None

    class Config:
        from_attributes = True
