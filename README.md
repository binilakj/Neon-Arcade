# Neon Arcade

A Django-based arcade gaming platform for a college project. It includes a neon-themed game library, user authentication, profile and score tracking, Snake, Memory Match, Click Rush, and a JavaScript/Canvas car racing game.

## Requirements
- Python 3.10+ (recommended)
- pip

## Run on Windows (PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_games
python manage.py createsuperuser
python manage.py runserver
```

Open http://127.0.0.1:8000/ . The admin site is at http://127.0.0.1:8000/admin/.

## Games
- Snake
- Memory Match
- Click Rush
- Neon Car Racer

## Notes
- This is a learning/college project starter, not production-hardened.
- Do not commit secrets, local databases, virtual environments, or private user uploads.
- Use only game assets that you own or have permission to distribute.
