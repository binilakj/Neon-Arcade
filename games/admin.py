from django.contrib import admin
from .models import Game, Score

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("title", "genre", "game_type", "featured")
    list_filter = ("game_type", "genre", "featured")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ("user", "game", "points", "created_at")
    list_filter = ("game",)
    readonly_fields = ("created_at",)
