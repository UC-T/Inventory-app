from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize the database object
db = SQLAlchemy()
flask_bcrypt = Bcrypt() # Use a distinct name like flask_bcrypt to avoid conflicts

class Category(db.Model):
    __tablename__ = 'categories'  # THIS IS THE MISSING LINK
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    icon = db.Column(db.String(50), default='Tag') # Added for UI
    color = db.Column(db.String(20), default='primary') # Added for UI
    
    # Relationships to get counts
    assets = db.relationship('AssetItem', backref='category_rel', lazy=True)
    # consumables = db.relationship('Consumable', backref='category_rel', lazy=True) # Add when Consumable has category_id

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "color": self.color,
            "assetCount": len(self.assets),
            "consumableCount": 0 # Logic for consumables to be added later
        }

class Location(db.Model):
    __tablename__ = 'locations'  # THIS IS THE MISSING LINK
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    assets = db.relationship('AssetItem', backref='location_rel', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "assetCount": len(self.assets)
        }

class AssetItem(db.Model):
    __tablename__ = 'assets'  # THIS IS THE MISSING LINK
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    asset_id = db.Column(db.String(50), unique=True, nullable=False) # v0 calls this asset_id
    serial = db.Column(db.String(100), unique=True)                 # Hardware serial
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=True)

    # New Fields to match Frontend
    status = db.Column(db.String(20), default='available') # available, checked-out, maintenance
    assigned_to = db.Column(db.String(100), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    mac_address = db.Column(db.String(17), nullable=True)
    warranty_date = db.Column(db.Date, nullable=True)

    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)

    def to_dict(self):
        """Converts the database object into a dictionary for JSON output"""
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "name": self.name,
            "serial": self.serial,
            "category": self.category.name if self.category else "Unassigned",
            "location": self.location.name if self.location else "Unassigned",
            "status": self.status,
            "assigned_to": self.assigned_to,
            "ip_address": self.ip_address,
            "mac_address": self.mac_address,
            "warranty_date": self.warranty_date.isoformat() if self.warranty_date else None
        }

class Consumable(db.Model):
    __tablename__ = 'consumables'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    sku = db.Column(db.String(50), unique=True)
    quantity = db.Column(db.Integer, default=0, nullable=False)
    min_threshold = db.Column(db.Integer, default=5)

    # Relationships (Make sure these match your Category/Location backrefs)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)

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
            "sku": self.sku,
            "quantity": self.quantity,
            "minStock": self.min_threshold, # Maps DB 'min_threshold' to UI 'minStock'
            "min_threshold": self.min_threshold,
            
            # Production feature: Flag low stock directly from the backend
            "is_low_stock": self.quantity <= self.min_threshold,
            "category": self.category.name if self.category else "General",
            "location": self.location.name if self.location else "Main Store"
            "last_updated": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None
        }

class User(db.Model):
    __tablename__ = 'users'  # THIS IS THE MISSING LINK
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

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)

    # Ensure 'users' matches the __tablename__ in your User model
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(255), nullable=False) # e.g., "Deleted Location: Warehouse A"
    timestamp = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }