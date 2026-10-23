from django.core.management.base import BaseCommand
from games.models import Game

GAMES = [
    {"title": "Neon Snake", "slug": "snake", "description": "Collect glowing orbs, grow your snake, and beat your high score.", "genre": "Arcade", "game_type": "browser", "featured": True},
    {"title": "Memory Match", "slug": "memory-match", "description": "Flip the cards, find every matching pair, and finish in as few moves as possible.", "genre": "Puzzle", "game_type": "browser", "featured": True},
    {"title": "Click Rush", "slug": "click-rush", "description": "A ten-second speed challenge. Click as quickly as possible and save your score.", "genre": "Casual", "game_type": "browser", "featured": True},
    {"title": "Neon Car Racer", "slug": "car-race", "description": "Dodge traffic on a neon highway, survive as long as you can, and save your best distance.", "genre": "Racing", "game_type": "browser", "featured": True},
]

class Command(BaseCommand):
    help = "Add or update the built-in Neon Arcade browser games."

    def handle(self, *args, **options):
        for item in GAMES:
            Game.objects.update_or_create(slug=item["slug"], defaults=item)
            self.stdout.write(self.style.SUCCESS(f'Added/updated: {item["title"]}'))
        self.stdout.write(self.style.SUCCESS("Neon Arcade demo games are ready."))
