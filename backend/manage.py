import os
import sys
from flask_migrate import Migrate
from app import create_app, db

# ─── PROFESSIONAL ADDITION ──────────────────────────────────
# This ensures that 'app' can be found regardless of how 
# Vercel invokes the script.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Create the application instance for Vercel to capture
app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    # Standard Flask CLI handles 'run', 'shell', and 'db'
    from flask.cli import main
    main()