# Copilot Instructions for SkillSwapping

## Project Overview
SkillSwapping is a web application for professionals to teach, learn, and connect over shared skills. It consists of a Flask backend and a static frontend.

## Architecture
- **backend/**: Python Flask app (`app.py`) serving API endpoints and static files. Uses SQLite (`app.db`) for user data.
- **frontend/**: Static HTML, CSS, JS, and assets. Entry point is `index.html`.
- **Data Flow**: Frontend interacts with backend via REST API (`/api/*`). User data is stored in SQLite.

## Key Files & Directories
- `backend/app.py`: Main Flask app. Defines API endpoints for user signup, login, and user listing. Serves static files from `frontend/`.
- `backend/app.db`: SQLite database for users.
- `backend/requirements.txt`: Python dependencies (Flask).
- `backend/clear_users.py`, `count_users.py`: Utility scripts for database management.
- `frontend/index.html`: Landing page. Other HTML files for different views.
- `frontend/assets/`, `frontend/css/`, `frontend/js/`, `frontend/images/`: Static resources.

## Developer Workflows
- **Run Backend**: `python backend/app.py` (default port 5001)
- **Install Dependencies**: `pip install -r backend/requirements.txt`
- **Clear Users**: `python backend/clear_users.py`
- **Count Users**: `python backend/count_users.py`
- **Frontend Development**: Edit files in `frontend/`. No build step required.

## Conventions & Patterns
- **API**: All endpoints are under `/api/` (e.g., `/api/users`, `/api/login`).
- **User Model**: See `app.py` for schema. Skills are stored as comma-separated strings.
- **Static Serving**: Flask serves files from `frontend/`.
- **CORS**: Enabled for all routes.
- **No authentication tokens**: Login returns basic user info only.
- **Frontend JS**: Handles UI logic and API calls. See `frontend/js/` for examples.

## Integration Points
- **Flask <-> Frontend**: Static files and API endpoints are served from the same Flask app.
- **SQLite**: Used for persistent user data. Utility scripts help manage data.

## Project-Specific Notes
- No build system for frontend; changes are live.
- No test suite or CI/CD defined yet.
- All backend scripts assume working directory is `backend/`.
- Database schema is created automatically on backend start.

## Example API Usage
```js
// Register user (frontend JS)
fetch('/api/users', { method: 'POST', body: JSON.stringify(userData), headers: { 'Content-Type': 'application/json' } })
```

---

If any section is unclear or missing, please provide feedback to improve these instructions.