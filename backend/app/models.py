from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize the database object
db = SQLAlchemy()
flask_bcrypt = Bcrypt() # Use a distinct name like flask_bcrypt to avoid conflicts

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    # Using name as unique ID per your request
    name = db.Column(db.String(100), primary_key=True) 
    contact_person = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))

    def to_dict(self):
        return {"name": self.name, "contact_person": self.contact_person or "", "email": self.email or "", "phone": self.phone or ""}

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(50), default='Tag')
    color = db.Column(db.String(20), default='primary')

    # FIX: Use back_populates and point it to the 'category' attribute in Consumable
    consumables = db.relationship('Consumable', back_populates='category', lazy=True)
    
    # We explicitly name the relationship 'asset_items' here
    asset_items = db.relationship('AssetItem', back_populates='category', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "color": self.color,
            "assetCount": len(self.asset_items) if self.asset_items else 0,
            "consumableCount": len(self.consumables) if self.consumables else 0
        }

class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50)) # e.g., Warehouse, Site, Office
    address = db.Column(db.String(255)) # <--- ADD THIS

    # Relationship to link back to assets/consumables
    consumables = db.relationship('Consumable', back_populates='location', lazy=True, overlaps="consumables")

    # Explicitly link to AssetItem
    asset_items = db.relationship('AssetItem', back_populates='location', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name or "Unnamed Location",
            "type": self.type or "Unspecified",
            "address": self.address or "No address provided"
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

    # ─── UPDATING EXISTING MODELS ─────────────────────────────────────
    # Add this column to both AssetItem and Consumable classes
    supplier_name = db.Column(db.String(100), db.ForeignKey('suppliers.name'), nullable=True)

    # Relationships
    # Use back_populates and point it to the relationship name in Category
    category = db.relationship('Category', back_populates='asset_items')
    # For Location, we'll use a unique backref name to avoid collisions
    location = db.relationship('Location', back_populates='asset_items')

    # Relationship to get the supplier object
    supplier = db.relationship('Supplier', backref='assets')

    def to_dict(self):
        """Converts the database object into a dictionary for JSON output"""
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "name": self.name,
            "serial": self.serial,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "ip_address": self.ip_address,
            "mac_address": self.mac_address,
            "warranty_date": self.warranty_date.strftime('%Y-%m-%d') if self.warranty_date else None,
            "category_id": self.category_id,
            "location_id": self.location_id,
            "category": self.category.name if self.category else "Uncategorized",
            "location": self.location.name if self.location else "Main Store",
            "supplier": self.supplier.to_dict() if self.supplier else {"name": "Not Assigned"},
            # Keep this for the Edit Modal dropdowns
            "supplier_name": self.supplier_name or "Legacy / Unknown"
        }

class Consumable(db.Model):
    __tablename__ = 'consumables'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    sku = db.Column(db.String(50), unique=True)
    quantity = db.Column(db.Integer, default=0, nullable=False)
    min_threshold = db.Column(db.Integer, default=5)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    # ─── UPDATING EXISTING MODELS ─────────────────────────────────────
    # Add this column to both AssetItem and Consumable classes
    supplier_name = db.Column(db.String(100), db.ForeignKey('suppliers.name'), nullable=True)

    # FIX: Use back_populates and point it to the 'consumables' attribute in Category
    category = db.relationship('Category', back_populates='consumables')
    location = db.relationship('Location', backref='consumables_list')

    # Relationship to get the supplier object
    supplier = db.relationship('Supplier', backref='consumables')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "quantity": self.quantity,
            "min_threshold": self.min_threshold,
            "is_low_stock": self.quantity <= self.min_threshold,
            # This 'self.category' now works perfectly with the relationship above
            "category": self.category.name if self.category else "General",
            "location": self.location.name if self.location else "Main Store",
            "supplier": self.supplier.to_dict() if self.supplier else {"name": "Not Assigned"},
            "supplier_name": self.supplier_name or "Legacy / Unknown",
            "last_updated": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None
        }

class MasterItem(db.Model):
    __tablename__ = 'master_items'
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100), unique=True, nullable=False)
    item_type = db.Column(db.String(20)) # 'Asset' or 'Consumable'
    last_added = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id, 
            "item_name": self.item_name, 
            "item_type": self.item_type,
            "last_added": self.last_updated.strftime("%Y-%m-%d")
        }

class User(db.Model):
    __tablename__ = 'users'  # THIS IS THE MISSING LINK
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # CHECK THIS LINE: It must be 'email', not 'username'
    email = db.Column(db.String(120), unique=True, nullable=False) 
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='end-user')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role
        } 

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