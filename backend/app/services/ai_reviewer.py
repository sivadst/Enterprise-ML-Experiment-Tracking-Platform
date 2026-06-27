from sqlalchemy.orm import Session
from app.models import metadata as meta_models
from app.schemas import schemas

def review_experiment_run(run_id: str, db: Session):
    run = db.query(meta_models.Run).filter(meta_models.Run.id == run_id).first()
    if not run:
        return
        
    metrics = db.query(meta_models.Metric).filter(meta_models.Metric.run_id == run_id).all()
    parameters = db.query(meta_models.Parameter).filter(meta_models.Parameter.run_id == run_id).all()
    
    # Clear existing reviews for this run
    db.query(meta_models.AIReview).filter(meta_models.AIReview.run_id == run_id).delete()
    
    reviews = []
    
    # Check for missing metadata
    if not run.model_name or not run.dataset_name:
        reviews.append(meta_models.AIReview(
            run_id=run_id,
            severity="Warning",
            evidence="Run is missing model_name or dataset_name.",
            suggested_action="Ensure that model and dataset names are logged during initialization.",
            confidence=1.0,
            summary="Missing experiment metadata"
        ))
        
    # Check high training time
    if run.duration and run.duration > 3600:
        reviews.append(meta_models.AIReview(
            run_id=run_id,
            severity="Info",
            evidence=f"Training duration is {run.duration} seconds.",
            suggested_action="Consider optimizing data loading or reducing model complexity.",
            confidence=0.8,
            summary="High training time"
        ))

    # Basic Metric checks (Overfitting/Underfitting)
    train_loss = [m.value for m in metrics if m.name.lower() in ["loss", "train_loss", "training_loss"]]
    val_loss = [m.value for m in metrics if m.name.lower() in ["val_loss", "validation_loss"]]
    accuracy = [m.value for m in metrics if m.name.lower() in ["accuracy", "acc", "val_accuracy"]]

    if train_loss and val_loss:
        final_train_loss = train_loss[-1]
        final_val_loss = val_loss[-1]
        
        if final_val_loss > final_train_loss * 1.5:
            reviews.append(meta_models.AIReview(
                run_id=run_id,
                severity="Error",
                evidence=f"Validation loss ({final_val_loss:.4f}) is significantly higher than training loss ({final_train_loss:.4f}).",
                suggested_action="Possible overfitting. Try adding regularization, dropout, or increasing dataset size.",
                confidence=0.9,
                summary="Possible overfitting"
            ))
            
        if final_train_loss > 1.0 and final_val_loss > 1.0: # Arbitrary threshold for underfitting check
            reviews.append(meta_models.AIReview(
                run_id=run_id,
                severity="Warning",
                evidence=f"Both training loss ({final_train_loss:.4f}) and validation loss ({final_val_loss:.4f}) are high.",
                suggested_action="Possible underfitting. Increase model capacity or train for more epochs.",
                confidence=0.75,
                summary="Possible underfitting"
            ))
            
    if accuracy:
        final_acc = accuracy[-1]
        if final_acc > 0.95:
             reviews.append(meta_models.AIReview(
                run_id=run_id,
                severity="Info",
                evidence=f"High accuracy achieved: {final_acc:.4f}.",
                suggested_action="Verify metric on holdout test set to ensure it generalizes well. If valid, candidate for Production.",
                confidence=0.85,
                summary="Candidate for Production"
            ))
        elif final_acc < 0.6:
            reviews.append(meta_models.AIReview(
                run_id=run_id,
                severity="Warning",
                evidence=f"Low validation score: {final_acc:.4f}.",
                suggested_action="Needs more training or hyperparameter tuning.",
                confidence=0.9,
                summary="Low validation score"
            ))

    # Metric Instability Check
    if len(val_loss) > 5:
        # Check variance of last 5 epochs
        last_5 = val_loss[-5:]
        avg = sum(last_5)/5
        variance = sum((x - avg) ** 2 for x in last_5) / 5
        if variance > 0.1: # Arbitrary instability threshold
            reviews.append(meta_models.AIReview(
                run_id=run_id,
                severity="Warning",
                evidence=f"Validation loss fluctuates significantly in recent epochs (variance: {variance:.4f}).",
                suggested_action="Check learning rate scheduling or batch size. Metric instability detected.",
                confidence=0.8,
                summary="Metric instability"
            ))

    for review in reviews:
        db.add(review)
        
    db.commit()
    return reviews
