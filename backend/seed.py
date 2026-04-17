import os
from app import create_app
from app.models import db, User, flask_bcrypt

app = create_app()

def seed_database():
    with app.app_context():
        print("--- ☁️ TARGET: SUPABASE CLOUD ---")
        
        # 1. Inspect the Model to debug the error
        columns = [m.key for m in User.__table__.columns]
        print(f"--- 🔍 Available columns in User model: {columns} ---")
        
        if 'email' not in columns:
            print("--- ❌ ERROR: Your model uses different names! Fix models.py first. ---")
            return

        admin_email = "admin@inventory.local"
        
        try:
            # Check if admin exists
            admin = User.query.filter_by(email=admin_email).first()

            if not admin:
                print("--- 🌱 Creating Admin... ---")
                new_admin = User(
                    name="System Admin",
                    email=admin_email,
                    role="admin",
                    password_hash=flask_bcrypt.generate_password_hash("admin123").decode('utf-8')
                )
                db.session.add(new_admin)
                db.session.commit()
                print(f"--- ✅ SUCCESS: Admin {admin_email} created in Supabase! ---")
            else:
                print(f"--- ⚠️ Admin {admin_email} already exists in Supabase. ---")
        
        except Exception as e:
            db.session.rollback()
            print(f"--- ❌ DATABASE ERROR: {str(e)} ---")

if __name__ == "__main__":
    seed_database()