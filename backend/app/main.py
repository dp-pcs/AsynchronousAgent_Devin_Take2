from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from app.models import Prediction, User, PredictionStatus, PredictionOutcome, create_db_and_tables, get_session
from app.schemas import PredictionCreate, PredictionResponse, PredictionResolve, LeaderboardEntry

app = FastAPI(title="CallBoard API", description="Prediction tracking API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/predictions", response_model=PredictionResponse)
async def create_prediction(
    prediction_data: PredictionCreate,
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == prediction_data.username)).first()
    if not user:
        user = User(username=prediction_data.username)
        session.add(user)
        session.commit()
        session.refresh(user)
    
    prediction = Prediction(
        title=prediction_data.title,
        category=prediction_data.category,
        stake=prediction_data.stake,
        expires_at=datetime.fromisoformat(prediction_data.expires_at.replace('Z', '+00:00')),
        username=prediction_data.username
    )
    session.add(prediction)
    session.commit()
    session.refresh(prediction)
    
    response_data = PredictionResponse(
        id=prediction.id,
        title=prediction.title,
        category=prediction.category,
        stake=prediction.stake,
        expires_at=prediction.expires_at.isoformat(),
        status=prediction.status,
        outcome=prediction.outcome,
        username=prediction.username,
        created_at=prediction.created_at.isoformat(),
        resolved_at=prediction.resolved_at.isoformat() if prediction.resolved_at else None
    )
    return response_data

@app.get("/predictions", response_model=List[PredictionResponse])
async def get_predictions(
    status: Optional[PredictionStatus] = None,
    username: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(Prediction)
    
    if status:
        query = query.where(Prediction.status == status)
    if username:
        query = query.where(Prediction.username == username)
    
    predictions = session.exec(query).all()
    response_predictions = []
    for pred in predictions:
        response_predictions.append(PredictionResponse(
            id=pred.id,
            title=pred.title,
            category=pred.category,
            stake=pred.stake,
            expires_at=pred.expires_at.isoformat(),
            status=pred.status,
            outcome=pred.outcome,
            username=pred.username,
            created_at=pred.created_at.isoformat(),
            resolved_at=pred.resolved_at.isoformat() if pred.resolved_at else None
        ))
    return response_predictions

@app.post("/predictions/{prediction_id}/resolve", response_model=PredictionResponse)
async def resolve_prediction(
    prediction_id: int,
    resolve_data: PredictionResolve,
    session: Session = Depends(get_session)
):
    prediction = session.get(Prediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if prediction.status == PredictionStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Prediction already resolved")
    
    if datetime.utcnow() < prediction.expires_at:
        raise HTTPException(status_code=400, detail="Prediction has not expired yet")
    
    prediction.status = PredictionStatus.RESOLVED
    prediction.outcome = resolve_data.outcome
    prediction.resolved_at = datetime.utcnow()
    
    user = session.exec(select(User).where(User.username == prediction.username)).first()
    if user:
        if resolve_data.outcome == PredictionOutcome.SUCCESS:
            user.total_points += prediction.stake
        else:
            user.total_points -= prediction.stake
    
    session.add(prediction)
    session.add(user)
    session.commit()
    session.refresh(prediction)
    
    response_data = PredictionResponse(
        id=prediction.id,
        title=prediction.title,
        category=prediction.category,
        stake=prediction.stake,
        expires_at=prediction.expires_at.isoformat(),
        status=prediction.status,
        outcome=prediction.outcome,
        username=prediction.username,
        created_at=prediction.created_at.isoformat(),
        resolved_at=prediction.resolved_at.isoformat() if prediction.resolved_at else None
    )
    return response_data

@app.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    leaderboard = []
    
    for user in users:
        predictions_count = len(session.exec(
            select(Prediction).where(Prediction.username == user.username)
        ).all())
        
        leaderboard.append(LeaderboardEntry(
            username=user.username,
            total_points=user.total_points,
            predictions_count=predictions_count
        ))
    
    leaderboard.sort(key=lambda x: x.total_points, reverse=True)
    return leaderboard
