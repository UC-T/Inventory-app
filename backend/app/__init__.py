import os
import re
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db, flask_bcrypt 

def create_app():
    app = Flask(__name__)
    
    # ─── DATABASE CONFIGURATION ─────────────────────────────────
    # Supabase gives you a 'postgres://' URI, but SQLAlchemy 1.4+ 
    # requires 'postgresql://'. This fix ensures compatibility.
    uri = os.environ.get('DATABASE_URL', 'sqlite:///../inventory.db')
    if uri.startswith("postgres://"):
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
        from .routes import api
        app.register_blueprint(api, url_prefix='/api')
        
        # This will automatically create your tables in Supabase 
        # the very first time the app runs on Vercel.
        db.create_all()

    return app