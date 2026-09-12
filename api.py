from fastapi import FastAPI
from pydantic import BaseModel

from adaptive_difficulty import calculate_next_difficulty
from database import initialize_database, save_game_session


# --------------------------------------------------
# CREATE FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="Adaptive Cognitive Game Backend",
    description="Backend for adaptive difficulty in cognitive games",
    version="1.0.0"
)


# --------------------------------------------------
# INPUT DATA MODEL
# --------------------------------------------------

class GameSession(BaseModel):

    patient_id: str
    game_type: str
    current_difficulty: str

    total_moves: int
    errors_made: int
    time_taken_seconds: float

    completed: bool


# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------

initialize_database()


# --------------------------------------------------
# HOME / HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "Adaptive Cognitive Game Backend is running",
        "status": "online"
    }


# --------------------------------------------------
# ADAPTIVE DIFFICULTY ENDPOINT
# --------------------------------------------------

@app.post("/adaptive-difficulty")
def adaptive_difficulty(session: GameSession):

    # Convert incoming data to dictionary
    session_data = session.model_dump()


    # ----------------------------------------------
    # STEP 1: Calculate adaptive difficulty
    # ----------------------------------------------

    result = calculate_next_difficulty(session_data)


    # ----------------------------------------------
    # STEP 2: Save game session to SQLite
    # ----------------------------------------------

    if result["success"]:

        session_id = save_game_session(session_data)

        result["session_id"] = session_id


    # ----------------------------------------------
    # STEP 3: Return result to frontend
    # ----------------------------------------------

    return result