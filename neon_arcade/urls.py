from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from games import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("games/", views.game_library, name="game_library"),
    path("games/<slug:slug>/", views.game_detail, name="game_detail"),
    path("play/snake/", views.snake_game, name="snake_game"),
    path("play/memory-match/", views.memory_game, name="memory_game"),
    path("play/click-rush/", views.click_game, name="click_game"),
    path("play/car-race/", views.car_race_game, name="car_race_game"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("signup/", views.signup_view, name="signup"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("profile/", views.profile, name="profile"),
    path("scores/save/", views.save_score, name="save_score"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
