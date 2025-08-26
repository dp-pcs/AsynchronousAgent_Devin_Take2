from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Annotated
from datetime import datetime
from app.models import PredictionStatus, PredictionOutcome

class PredictionCreate(BaseModel):
    title: str
    category: Optional[str] = None
    stake: int = Field(default=10, gt=0)
    expires_at: str
    username: str

class PredictionResponse(BaseModel):
    id: int
    title: str
    category: Optional[str]
    stake: int
    expires_at: str
    status: PredictionStatus
    outcome: Optional[PredictionOutcome]
    username: str
    created_at: str
    resolved_at: Optional[str]

class PredictionResolve(BaseModel):
    outcome: PredictionOutcome

class LeaderboardEntry(BaseModel):
    username: str
    total_points: int
    predictions_count: int
