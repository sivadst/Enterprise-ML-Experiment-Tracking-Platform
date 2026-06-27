import os
import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import METADATA_DB_URL, ARTIFACTS_DB_URL
from app.models import metadata as meta_models
from app.models import artifacts as art_models
from app.services.ai_reviewer import review_experiment_run

def seed_data():
    meta_engine = create_engine(METADATA_DB_URL)
    MetaSession = sessionmaker(bind=meta_engine)
    meta_db = MetaSession()

    art_engine = create_engine(ARTIFACTS_DB_URL)
    ArtSession = sessionmaker(bind=art_engine)
    art_db = ArtSession()

    print("Seeding Users...")
    users = [
        meta_models.User(username="jules", email="jules@example.com"),
        meta_models.User(username="data_scientist_1", email="ds1@example.com")
    ]
    meta_db.add_all(users)
    meta_db.commit()

    print("Seeding Projects...")
    proj1 = meta_models.Project(name="Customer Churn Prediction", description="Predicting churn for SaaS product.", owner="jules", tags=["classification", "xgboost"])
    proj2 = meta_models.Project(name="Image Classification", description="ResNet on custom dataset.", owner="data_scientist_1", tags=["cv", "deep_learning"])
    meta_db.add_all([proj1, proj2])
    meta_db.commit()

    print("Seeding Datasets...")
    ds1 = meta_models.DatasetRegistry(name="Churn_Data", version="v1.0", row_count=10000, column_count=20, tags=["tabular", "clean"])
    ds2 = meta_models.DatasetRegistry(name="Images_V2", version="v2.1", row_count=50000, tags=["images", "resized"])
    meta_db.add_all([ds1, ds2])
    meta_db.commit()

    print("Seeding Experiments...")
    exp1 = meta_models.Experiment(project_id=proj1.id, name="Baseline RF", dataset_version="v1.0", model_type="RandomForest", tags=["baseline"])
    exp2 = meta_models.Experiment(project_id=proj1.id, name="XGBoost Tuning", dataset_version="v1.0", model_type="XGBoost", tags=["tuning"])
    exp3 = meta_models.Experiment(project_id=proj2.id, name="ResNet50 Initial", dataset_version="v2.1", model_type="ResNet50", tags=["baseline"])
    meta_db.add_all([exp1, exp2, exp3])
    meta_db.commit()

    print("Seeding Runs and Metrics...")
    runs = []
    for exp in [exp1, exp2, exp3]:
        for i in range(3):
            run_id = str(uuid.uuid4())
            start_time = datetime.utcnow() - timedelta(days=random.randint(1, 10))
            duration = random.uniform(300, 4000)
            end_time = start_time + timedelta(seconds=duration)
            
            run = meta_models.Run(
                id=run_id,
                experiment_id=exp.id,
                name=f"Run_{i+1}",
                start_time=start_time,
                end_time=end_time,
                duration=duration,
                status="Completed",
                model_name=exp.model_type,
                dataset_name=exp.dataset_version,
                notes=f"Test run {i+1} for {exp.name}"
            )
            runs.append(run)
            meta_db.add(run)
            
            # Add parameters
            meta_db.add(meta_models.Parameter(run_id=run_id, name="learning_rate", value=str(random.choice([0.01, 0.001, 0.0001]))))
            meta_db.add(meta_models.Parameter(run_id=run_id, name="batch_size", value=str(random.choice([16, 32, 64]))))
            meta_db.add(meta_models.Parameter(run_id=run_id, name="epochs", value="50"))

            # Add metrics
            train_loss = 2.0
            val_loss = 2.5
            accuracy = 0.5
            for step in range(1, 51):
                train_loss = max(0.1, train_loss - random.uniform(0.01, 0.05))
                # Add some instability or overfitting occasionally
                if i == 0 and step > 30: # Simulate overfitting in first run
                    val_loss += random.uniform(0.01, 0.05)
                else:
                    val_loss = max(0.15, val_loss - random.uniform(0.005, 0.04))
                
                accuracy = min(0.99, accuracy + random.uniform(0.005, 0.02))
                
                meta_db.add(meta_models.Metric(run_id=run_id, name="train_loss", value=train_loss, step=step, timestamp=start_time + timedelta(seconds=step*10)))
                meta_db.add(meta_models.Metric(run_id=run_id, name="val_loss", value=val_loss, step=step, timestamp=start_time + timedelta(seconds=step*10)))
                meta_db.add(meta_models.Metric(run_id=run_id, name="accuracy", value=accuracy, step=step, timestamp=start_time + timedelta(seconds=step*10)))

    meta_db.commit()

    print("Generating AI Reviews...")
    for run in runs:
        review_experiment_run(run.id, meta_db)

    print("Seeding Models...")
    mod1 = meta_models.ModelRegistry(name="Churn_XGB", version="v1", stage="Production", run_id=runs[1].id)
    mod2 = meta_models.ModelRegistry(name="ResNet50_Custom", version="v1", stage="Staging", run_id=runs[4].id)
    meta_db.add_all([mod1, mod2])
    meta_db.commit()

    print("Database Seeded Successfully.")
    
    meta_db.close()
    art_db.close()

if __name__ == "__main__":
    seed_data()
