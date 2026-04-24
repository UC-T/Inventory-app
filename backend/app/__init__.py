import os
import re
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .models import db, flask_bcrypt 
from dotenv import load_dotenv  # <--- ADD THIS

def create_app():
    app = Flask(__name__)
    
    # ─── DATABASE CONFIGURATION ─────────────────────────────────
    # Supabase gives you a 'postgres://' URI, but SQLAlchemy 1.4+ 
    # requires 'postgresql://'. This fix ensures compatibility.
    # Force SQLite if we are running in DEBUG mode locally

    # Priority 1: Check for the environment variable (Supabase)
    # Priority 2: Only use SQLite as a fallback if the Cloud URL is missing
    uri = os.environ.get('DATABASE_URL')

    if not uri:
        # Final fallback if no environment variable is found
        uri = 'sqlite:///dev.db'
        print("--- 🏠 DATABASE: LOCAL (SQLite) accessed ---")
    else:
        # Cloud logging
        db_host = uri.split('@')[-1].split('/')[0] if '@' in uri else "Supabase"
        print(f"--- ☁️ DATABASE: CLOUD ({db_host}) accessed ---")

    # ─── LOGGING THE SOURCE ─────────────────────────────────────
   # ─── PROTOCOL FIX ──────────────────────────────────────────
    # SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
    if uri and uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # ─── SECURITY CONFIGURATION ──────────────────────────────────
    # Default to a dev key only if not in production
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-key-temporary')
    
    # ─── EXTENSION INITIALIZATION ────────────────────────────────
    db.init_app(app)
    flask_bcrypt.init_app(app)
    JWTManager(app)
    
    # ─── PRODUCTION CORS ────────────────────────────────────────
    # Locally we use localhost:3000. In production, we allow the Vercel domain.
    # Setting origins to '*' is easiest for the 'Show on the Road', 
    # but using environment variables is more professional.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ─── BLUEPRINTS & TABLE CREATION ────────────────────────────
    with app.app_context():
        # IMPORTANT: Import ALL models here so Alembic can see them
        from . import models

        from .routes import api
        app.register_blueprint(api, url_prefix='/api')
        
        # This will automatically create your tables in Supabase 
        # the very first time the app runs on Vercel.
        # db.create_all() <-- Comment this out once your initial tables are live

    return app