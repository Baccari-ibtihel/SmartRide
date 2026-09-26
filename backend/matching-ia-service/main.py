from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="SmartRide AI Matching Service", version="1.0.0")

class RouteMatchRequest(BaseModel):
    passenger_origin_lat: float
    passenger_origin_lng: float
    passenger_dest_lat: float
    passenger_dest_lng: float
    departure_time: str

class MatchResult(BaseModel):
    trip_id: str
    driver_name: str
    match_score: float # 0.0 to 1.0 (Percentage)
    detour_minutes: int
    estimated_price: float

@app.get("/")
def read_root():
    return {"service": "SmartRide AI Matching Engine", "status": "active"}

@app.post("/api/matching/recommend", response_model=List[MatchResult])
def recommend_trips(request: RouteMatchRequest):
    # Simulated AI matching algorithm scoring route overlap and temporal compatibility
    return [
        MatchResult(
            trip_id="TRIP-9901",
            driver_name="Mohamed Ben Ali",
            match_score=0.96,
            detour_minutes=3,
            estimated_price=12.50
        ),
        MatchResult(
            trip_id="TRIP-9904",
            driver_name="Sarra Trabelsi",
            match_score=0.88,
            detour_minutes=7,
            estimated_price=11.00
        )
    ]
