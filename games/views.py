from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db.models import Max
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST
from .models import Game, Score

def home(request):
    return render(request, "games/home.html", {
        "featured_games": Game.objects.filter(featured=True)[:6],
        "recent_games": Game.objects.all()[:8],
    })

def game_library(request):
    games = Game.objects.all()
    query = request.GET.get("q", "").strip()
    genre = request.GET.get("genre", "").strip()
    kind = request.GET.get("type", "").strip()
    if query:
        games = games.filter(title__icontains=query)
    if genre:
        games = games.filter(genre__iexact=genre)
    if kind in ("browser", "download"):
        games = games.filter(game_type=kind)
    genres = Game.objects.values_list("genre", flat=True).distinct().order_by("genre")
    return render(request, "games/library.html", {
        "games": games, "query": query, "genre": genre, "kind": kind, "genres": genres,
    })

def game_detail(request, slug):
    game = get_object_or_404(Game, slug=slug)
    top_scores = Score.objects.filter(game=game).select_related("user")[:10]
    return render(request, "games/detail.html", {"game": game, "top_scores": top_scores})

def snake_game(request):
    return render(request, "games/snake.html")

def memory_game(request):
    return render(request, "games/memory.html")

def click_game(request):
    return render(request, "games/click.html")

def car_race_game(request):
    return render(request, "games/car_race.html")

def leaderboard(request):
    rows = Score.objects.values("user__username", "game__title").annotate(best=Max("points")).order_by("-best")[:50]
    return render(request, "games/leaderboard.html", {"rows": rows})

def signup_view(request):
    if request.user.is_authenticated:
        return redirect("profile")
    form = UserCreationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Welcome to Neon Arcade!")
        return redirect("profile")
    return render(request, "games/auth.html", {"form": form, "page_title": "Create your account", "mode": "signup"})

def login_view(request):
    if request.user.is_authenticated:
        return redirect("profile")
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        messages.success(request, "Welcome back!")
        return redirect("profile")
    return render(request, "games/auth.html", {"form": form, "page_title": "Welcome back", "mode": "login"})

def logout_view(request):
    if request.method == "POST":
        logout(request)
    return redirect("home")

@login_required
def profile(request):
    scores = Score.objects.filter(user=request.user).select_related("game")[:20]
    best_scores = Score.objects.filter(user=request.user).values("game__title").annotate(best=Max("points")).order_by("-best")
    return render(request, "games/profile.html", {"scores": scores, "best_scores": best_scores})

@login_required
@require_POST
def save_score(request):
    try:
        points = int(request.POST.get("points", "0"))
    except (TypeError, ValueError):
        return JsonResponse({"ok": False, "error": "Invalid score"}, status=400)
    slug = request.POST.get("game_slug", "snake").strip()
    games = {
        "snake": ("Neon Snake", "Collect glowing orbs and grow your snake.", "Arcade"),
        "memory-match": ("Memory Match", "Match all pairs in the fewest moves.", "Puzzle"),
        "click-rush": ("Click Rush", "Test your speed in a 10-second click challenge.", "Casual"),
        "car-race": ("Neon Car Racer", "Dodge traffic, survive the highway, and set a new distance record.", "Racing"),
    }
    if slug not in games or points < 0 or points > 1000000:
        return JsonResponse({"ok": False, "error": "Invalid game or score"}, status=400)
    title, description, genre = games[slug]
    game, _ = Game.objects.get_or_create(slug=slug, defaults={
        "title": title, "description": description, "genre": genre,
        "game_type": "browser", "featured": True,
    })
    Score.objects.create(user=request.user, game=game, points=points)
    return JsonResponse({"ok": True, "points": points})
