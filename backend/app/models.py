from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize the database object
db = SQLAlchemy()
flask_bcrypt = Bcrypt() # Use a distinct name like flask_bcrypt to avoid conflicts

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    # Relationship to link items to this category
    items = db.relationship('InventoryItem', backref='category', lazy=True)

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    items = db.relationship('InventoryItem', backref='location', lazy=True)

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    price = db.Column(db.Float, nullable=False)
    # Foreign Keys to link to Category and Location
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=True)

    def to_dict(self):
        """Converts the database object into a dictionary for JSON output"""
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "quantity": self.quantity,
            "price": self.price,
            "category": self.category.name if self.category else "Unassigned",
            "location": self.location.name if self.location else "Unassigned"
        }

class Consumable(db.Model):
    __tablename__ = 'consumables'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    quantity = db.Column(db.Integer, default=0, nullable=False)
    min_threshold = db.Column(db.Integer, default=5, nullable=False)
    # Optional: Track when it was last updated
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        """
        Excellent necessary use case: 
        Convert the SQLAlchemy object into a dictionary for JSON responses.
        """
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "min_threshold": self.min_threshold,
            # Production feature: Flag low stock directly from the backend
            "is_low_stock": self.quantity <= self.min_threshold,
            "last_updated": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='staff', nullable=False) # 'admin' or 'staff'

    def set_password(self, password):
        # Use the renamed instance here
        self.password_hash = flask_bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        # Use the renamed instance here
        return flask_bcrypt.check_password_hash(self.password_hash, password)