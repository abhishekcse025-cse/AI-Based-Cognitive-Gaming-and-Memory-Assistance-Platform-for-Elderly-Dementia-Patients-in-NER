# --------------------------------------------------
# ADAPTIVE DIFFICULTY ENGINE
# --------------------------------------------------

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]


# Minimum possible moves for each game
MINIMUM_MOVES = {
    "memory_match": {
        "easy": 4,
        "medium": 6,
        "hard": 8
    },

    "sequence": {
        "easy": 3,
        "medium": 4,
        "hard": 5
    }
}


# --------------------------------------------------
# CHANGE DIFFICULTY
# --------------------------------------------------

def change_difficulty(current_difficulty, direction):

    current_index = DIFFICULTY_LEVELS.index(current_difficulty)

    if direction == "up":
        new_index = min(
            current_index + 1,
            len(DIFFICULTY_LEVELS) - 1
        )

    elif direction == "down":
        new_index = max(
            current_index - 1,
            0
        )

    else:
        new_index = current_index

    return DIFFICULTY_LEVELS[new_index]


# --------------------------------------------------
# VALIDATE INPUT
# --------------------------------------------------

def validate_session(session):

    required_fields = [
        "patient_id",
        "game_type",
        "current_difficulty",
        "total_moves",
        "errors_made",
        "time_taken_seconds",
        "completed"
    ]

    # Check for missing fields
    for field in required_fields:

        if field not in session:
            return False, f"Missing field: {field}"


    # Check game type
    if session["game_type"] not in ["memory_match", "sequence"]:
        return False, "Invalid game_type"


    # Check difficulty
    if session["current_difficulty"] not in DIFFICULTY_LEVELS:
        return False, "Invalid difficulty"


    # Check numerical values
    if session["total_moves"] < 0:
        return False, "total_moves cannot be negative"

    if session["errors_made"] < 0:
        return False, "errors_made cannot be negative"

    if session["time_taken_seconds"] < 0:
        return False, "time_taken_seconds cannot be negative"


    # Check completed value
    if not isinstance(session["completed"], bool):
        return False, "completed must be True or False"


    return True, "Valid"


# --------------------------------------------------
# ADAPTIVE DIFFICULTY ENGINE
# --------------------------------------------------

def calculate_next_difficulty(session):

    # Validate input first
    is_valid, message = validate_session(session)

    if not is_valid:

        return {
            "success": False,
            "error": message
        }


    patient_id = session["patient_id"]
    game_type = session["game_type"]
    current_difficulty = session["current_difficulty"]

    total_moves = session["total_moves"]
    errors_made = session["errors_made"]
    time_taken = session["time_taken_seconds"]
    completed = session["completed"]


    # --------------------------------------------------
    # FRUSTRATION TRIGGER
    # --------------------------------------------------

    # If the game was abandoned,
    # immediately reduce difficulty.
    #
    # Ignore all other metrics.

    if not completed:

        next_difficulty = change_difficulty(
            current_difficulty,
            "down"
        )

        return {
            "success": True,
            "patient_id": patient_id,
            "game_type": game_type,
            "current_difficulty": current_difficulty,
            "performance": "frustration",
            "next_difficulty": next_difficulty,
            "reason": "Game was not completed"
        }


    # --------------------------------------------------
    # MEMORY MATCH EFFICIENCY SAFEGUARD
    # --------------------------------------------------

    if (
        game_type == "memory_match"
        and current_difficulty == "easy"
        and total_moves > 8
    ):

        return {
            "success": True,
            "patient_id": patient_id,
            "game_type": game_type,
            "current_difficulty": current_difficulty,
            "performance": "needs_practice",
            "next_difficulty": "easy",
            "reason": "More than double the minimum moves"
        }


    # --------------------------------------------------
    # PERFORMANCE SCORE
    # --------------------------------------------------

    score = 0


    # Errors
    if errors_made == 0:
        score += 2

    elif errors_made <= 2:
        score += 1


    # Time
    if time_taken <= 15:
        score += 2

    elif time_taken <= 30:
        score += 1


    # Move efficiency
    minimum_moves = MINIMUM_MOVES[
        game_type
    ][
        current_difficulty
    ]


    if total_moves <= minimum_moves + 2:
        score += 2

    elif total_moves <= minimum_moves + 4:
        score += 1


    # --------------------------------------------------
    # PERFORMANCE LEVEL
    # --------------------------------------------------

    if score >= 5:
        performance = "good"

    elif score >= 3:
        performance = "average"

    else:
        performance = "poor"


    # --------------------------------------------------
    # ADJUST DIFFICULTY
    # --------------------------------------------------

    if performance == "good":

        next_difficulty = change_difficulty(
            current_difficulty,
            "up"
        )

        reason = "Strong performance"


    elif performance == "poor":

        next_difficulty = change_difficulty(
            current_difficulty,
            "down"
        )

        reason = "Performance needs improvement"


    else:

        next_difficulty = current_difficulty

        reason = "Performance is stable"


    # --------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------

    return {
        "success": True,
        "patient_id": patient_id,
        "game_type": game_type,
        "current_difficulty": current_difficulty,
        "performance": performance,
        "score": score,
        "next_difficulty": next_difficulty,
        "reason": reason
    }