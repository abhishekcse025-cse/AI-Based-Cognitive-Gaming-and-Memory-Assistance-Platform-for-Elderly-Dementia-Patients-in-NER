# SIH Adaptive Cognitive Game Backend

Backend prototype for an adaptive cognitive game designed for older adults.

## Features

- Adaptive difficulty for Memory Match and Sequencing games
- Three difficulty levels: Easy, Medium, Hard
- Performance-based difficulty adjustment
- Frustration trigger for abandoned games
- SQLite storage for game sessions
- FastAPI REST API
- Input validation
- Backend test cases

## Project Structure

- `adaptive_difficulty.py` - Adaptive difficulty engine
- `test_backend.py` - Backend tests
- `api.py` - FastAPI API
- `database.py` - SQLite database functions
- `requirements.txt` - Python dependencies

## Run the Backend

Install dependencies:

```bash
py -3.11 -m pip install -r requirements.txt