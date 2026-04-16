from app import create_app
from app.models import db, User, flask_bcrypt

app = create_app()

def seed_database():
    with app.app_context():
        # 1. Check if Admin already exists to avoid duplicates
        admin_email = "admin@inventory.local"
        existing_user = User.query.filter_by(email=admin_email).first()

        if not existing_user:
            print("--- 🌱 Seeding Production Admin User ---")
            admin = User(
                name="System Administrator",
                email=admin_email,
                role="admin",  # Must match your ROLES.ADMIN in React
                password_hash=flask_bcrypt.generate_password_hash("admin123").decode('utf-8')
            )
            db.session.add(admin)
            db.session.commit()
            print(f"--- ✅ Admin created: {admin_email} ---")
        else:
            print("--- ⚠️ Admin already exists. Skipping... ---")

if __name__ == "__main__":
    seed_database()