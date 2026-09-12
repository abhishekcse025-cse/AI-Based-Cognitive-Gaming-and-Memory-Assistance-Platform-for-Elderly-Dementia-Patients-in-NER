import json

from adaptive_difficulty import calculate_next_difficulty


# --------------------------------------------------
# TEST CASES
# --------------------------------------------------

test_cases = [

    {
        "name": "Good Memory Match",

        "session": {
            "patient_id": "P-101",
            "game_type": "memory_match",
            "current_difficulty": "medium",
            "total_moves": 8,
            "errors_made": 0,
            "time_taken_seconds": 12,
            "completed": True
        }
    },


    {
        "name": "Average Memory Match",

        "session": {
            "patient_id": "P-102",
            "game_type": "memory_match",
            "current_difficulty": "medium",
            "total_moves": 9,
            "errors_made": 2,
            "time_taken_seconds": 25,
            "completed": True
        }
    },


    {
        "name": "Poor Memory Match",

        "session": {
            "patient_id": "P-103",
            "game_type": "memory_match",
            "current_difficulty": "medium",
            "total_moves": 15,
            "errors_made": 6,
            "time_taken_seconds": 50,
            "completed": True
        }
    },


    {
        "name": "Abandoned Game",

        "session": {
            "patient_id": "P-104",
            "game_type": "memory_match",
            "current_difficulty": "medium",
            "total_moves": 5,
            "errors_made": 0,
            "time_taken_seconds": 8,
            "completed": False
        }
    },


    {
        "name": "Easy Memory Match Efficiency",

        "session": {
            "patient_id": "P-105",
            "game_type": "memory_match",
            "current_difficulty": "easy",
            "total_moves": 10,
            "errors_made": 0,
            "time_taken_seconds": 10,
            "completed": True
        }
    },


    {
        "name": "Hard Difficulty Boundary",

        "session": {
            "patient_id": "P-106",
            "game_type": "memory_match",
            "current_difficulty": "hard",
            "total_moves": 8,
            "errors_made": 0,
            "time_taken_seconds": 10,
            "completed": True
        }
    },


    {
        "name": "Good Sequencing",

        "session": {
            "patient_id": "P-107",
            "game_type": "sequence",
            "current_difficulty": "medium",
            "total_moves": 5,
            "errors_made": 0,
            "time_taken_seconds": 12,
            "completed": True
        }
    },


    {
        "name": "Poor Sequencing",

        "session": {
            "patient_id": "P-108",
            "game_type": "sequence",
            "current_difficulty": "medium",
            "total_moves": 10,
            "errors_made": 5,
            "time_taken_seconds": 45,
            "completed": True
        }
    }
]


# --------------------------------------------------
# RUN TESTS
# --------------------------------------------------

print("\n==========================================")
print("     ADAPTIVE DIFFICULTY TESTING")
print("==========================================")


for test in test_cases:

    print("\n" + test["name"])
    print("------------------------------------------")

    result = calculate_next_difficulty(
        test["session"]
    )

    print(json.dumps(result, indent=4))


print("\n==========================================")
print("          TESTING COMPLETE")
print("==========================================")