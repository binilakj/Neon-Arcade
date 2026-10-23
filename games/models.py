from django.conf import settings
from django.db import models

class Game(models.Model):
    GAME_TYPES = [
        ("browser", "Browser"),
        ("download", "Download"),
    ]
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    genre = models.CharField(max_length=60, default="Arcade")
    game_type = models.CharField(max_length=12, choices=GAME_TYPES, default="browser")
    cover = models.ImageField(upload_to="game_covers/", blank=True, null=True)
    download_url = models.URLField(blank=True, help_text="Use an official/authorized download URL.")
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-featured", "title"]

    def __str__(self):
        return self.title

class Score(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_scores")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="scores")
    points = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-points", "-created_at"]

    def __str__(self):
        return f"{self.user} — {self.game}: {self.points}"
