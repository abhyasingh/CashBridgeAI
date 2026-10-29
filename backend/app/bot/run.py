"""Entry point for running the Telegram Bot standalone process."""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parents[2]
sys.path.insert(0, str(backend_dir))

from app.bot.telegram_bot import create_bot_app


def main():
    print("Initializing CashBridge AI Telegram Bot...")
    app = create_bot_app()
    if not app:
        print("Bot token not configured in .env (TELEGRAM_BOT_TOKEN). Set token to activate live polling.")
        return

    print("Telegram bot polling started successfully!")
    app.run_polling()


if __name__ == "__main__":
    main()
