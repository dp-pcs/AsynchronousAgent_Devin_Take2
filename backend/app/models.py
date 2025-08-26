from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import ConfigDict

class PredictionStatus(str, Enum):
    OPEN = "open"
    RESOLVED = "resolved"

class PredictionOutcome(str, Enum):
    SUCCESS = "success"
    FAIL = "fail"

class Prediction(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    category: Optional[str] = None
    stake: int = Field(default=10)
    expires_at: datetime
    status: PredictionStatus = Field(default=PredictionStatus.OPEN)
    outcome: Optional[PredictionOutcome] = None
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    resolved_at: Optional[datetime] = None

class User(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    total_points: int = Field(default=0)

engine = create_engine(
    "sqlite:///./test.db", 
    echo=True,
    connect_args={"check_same_thread": False}
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
