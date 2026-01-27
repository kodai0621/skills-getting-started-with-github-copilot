"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path
import httpx

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.get("/pull-requests")
async def get_pull_requests():
    """Get the latest open pull requests for this repository"""
    # Repository details - hardcoded for this specific demo application
    # In production, these should be environment variables
    owner = "kodai0621"
    repo = "skills-getting-started-with-github-copilot"
    
    # GitHub API endpoint
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    params = {
        "state": "open",
        "sort": "created",
        "direction": "desc"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            
            pulls = response.json()
            
            # Format the response to include only relevant information
            formatted_pulls = []
            for pr in pulls:
                formatted_pulls.append({
                    "number": pr["number"],
                    "title": pr["title"],
                    "author": pr["user"]["login"],
                    "created_at": pr["created_at"],
                    "updated_at": pr["updated_at"],
                    "html_url": pr["html_url"],
                    "state": pr["state"]
                })
            
            return {"pull_requests": formatted_pulls}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pull requests: {str(e)}")

