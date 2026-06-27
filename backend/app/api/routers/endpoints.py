from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import shutil

from app.db.database import get_metadata_db, get_artifacts_db
from app.models import metadata as meta_models
from app.models import artifacts as art_models
from app.schemas import schemas

router = APIRouter()

@router.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_metadata_db)):
    db_project = meta_models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[schemas.ProjectResponse])
def list_projects(db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Project).all()

@router.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_metadata_db)):
    proj = db.query(meta_models.Project).filter(meta_models.Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.post("/experiments", response_model=schemas.ExperimentResponse)
def create_experiment(exp: schemas.ExperimentCreate, db: Session = Depends(get_metadata_db)):
    db_exp = meta_models.Experiment(**exp.model_dump())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/projects/{project_id}/experiments", response_model=List[schemas.ExperimentResponse])
def list_experiments_for_project(project_id: int, db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Experiment).filter(meta_models.Experiment.project_id == project_id).all()

@router.get("/experiments", response_model=List[schemas.ExperimentResponse])
def list_experiments(db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Experiment).all()

@router.post("/runs", response_model=schemas.RunResponse)
def create_run(run: schemas.RunCreate, db: Session = Depends(get_metadata_db)):
    db_run = meta_models.Run(**run.model_dump())
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run

@router.get("/experiments/{experiment_id}/runs", response_model=List[schemas.RunResponse])
def list_runs_for_experiment(experiment_id: int, db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Run).filter(meta_models.Run.experiment_id == experiment_id).all()

@router.put("/runs/{run_id}/status")
def update_run_status(run_id: str, status: str, db: Session = Depends(get_metadata_db)):
    run = db.query(meta_models.Run).filter(meta_models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    run.status = status
    if status in ["Completed", "Failed", "Archived"]:
        run.end_time = datetime.utcnow()
        if run.start_time:
            run.duration = (run.end_time - run.start_time).total_seconds()
    db.commit()
    db.refresh(run)
    return run

@router.post("/metrics", response_model=schemas.MetricResponse)
def log_metric(metric: schemas.MetricCreate, db: Session = Depends(get_metadata_db)):
    db_metric = meta_models.Metric(**metric.model_dump())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.get("/runs/{run_id}/metrics", response_model=List[schemas.MetricResponse])
def get_run_metrics(run_id: str, db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Metric).filter(meta_models.Metric.run_id == run_id).all()

@router.post("/parameters", response_model=schemas.ParameterResponse)
def log_parameter(param: schemas.ParameterCreate, db: Session = Depends(get_metadata_db)):
    db_param = meta_models.Parameter(**param.model_dump())
    db.add(db_param)
    db.commit()
    db.refresh(db_param)
    return db_param

@router.get("/runs/{run_id}/parameters", response_model=List[schemas.ParameterResponse])
def get_run_parameters(run_id: str, db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.Parameter).filter(meta_models.Parameter.run_id == run_id).all()

@router.get("/models", response_model=List[schemas.ModelRegistryResponse])
def list_models(db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.ModelRegistry).all()

@router.post("/models", response_model=schemas.ModelRegistryResponse)
def register_model(model: schemas.ModelRegistryCreate, db: Session = Depends(get_metadata_db)):
    db_model = meta_models.ModelRegistry(**model.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@router.get("/datasets", response_model=List[schemas.DatasetRegistryResponse])
def list_datasets(db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.DatasetRegistry).all()

@router.post("/datasets", response_model=schemas.DatasetRegistryResponse)
def register_dataset(dataset: schemas.DatasetRegistryCreate, db: Session = Depends(get_metadata_db)):
    db_dataset = meta_models.DatasetRegistry(**dataset.model_dump())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

@router.post("/artifacts", response_model=schemas.ArtifactResponse)
async def upload_artifact(
    run_id: str = Form(...),
    version: str = Form("v1"),
    file: UploadFile = File(...),
    db: Session = Depends(get_artifacts_db)
):
    storage_dir = f"../storage/artifacts/{run_id}"
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    size = os.path.getsize(file_path)
    
    db_artifact = art_models.ArtifactMetadata(
        run_id=run_id,
        filename=file.filename,
        file_path=file_path,
        size=size,
        mime_type=file.content_type,
        version=version
    )
    db.add(db_artifact)
    db.commit()
    db.refresh(db_artifact)
    return db_artifact

@router.get("/runs/{run_id}/artifacts", response_model=List[schemas.ArtifactResponse])
def get_run_artifacts(run_id: str, db: Session = Depends(get_artifacts_db)):
    return db.query(art_models.ArtifactMetadata).filter(art_models.ArtifactMetadata.run_id == run_id).all()

from app.services.ai_reviewer import review_experiment_run

@router.post("/runs/{run_id}/review", response_model=List[schemas.AIReviewResponse])
def generate_ai_review(run_id: str, db: Session = Depends(get_metadata_db)):
    reviews = review_experiment_run(run_id, db)
    return db.query(meta_models.AIReview).filter(meta_models.AIReview.run_id == run_id).all()

@router.get("/runs/{run_id}/review", response_model=List[schemas.AIReviewResponse])
def get_ai_reviews(run_id: str, db: Session = Depends(get_metadata_db)):
    return db.query(meta_models.AIReview).filter(meta_models.AIReview.run_id == run_id).all()
