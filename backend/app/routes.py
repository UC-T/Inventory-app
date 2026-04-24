from flask import Flask, jsonify, request, Blueprint  # <--- Ensure Blueprint is here # 1. Imports first
# from .models import db, AssetItem
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from .models import db, AssetItem, User, flask_bcrypt, Category, Location, Consumable, AuditLog, Supplier, MasterItem # <--- Import all your models here
from functools import wraps
from flask_jwt_extended import get_jwt_identity
import pandas as pd
from flask import send_file
from flask_cors import CORS
from datetime import timedelta, datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func  # <--- THIS IS THE MISSING PIECE!
import io
import os

api = Blueprint('api', __name__)

# --- DEFINE THE DECORATOR HERE (Before the routes) ---
# Helper Function: Check if the user is an admin
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user and user.role == 'admin':
            return fn(*args, **kwargs)
        else:
            return jsonify({"message": "Admins only! Access denied."}), 403
    return wrapper

def update_master_sheet(name, item_type):
    """Adds a unique item name to the Master Sheet if it doesn't exist."""
    from .models import MasterItem
    existing = MasterItem.query.filter_by(item_name=name).first()
    if not existing:
        new_master = MasterItem(item_name=name, item_type=type)
        db.session.add(new_master)
    else:
        existing.last_added = db.func.now()

# 5. Routes (Always go AFTER app is defined)
@api.route('/assets', methods=['GET'])
@jwt_required()
def get_inventory():
    items = AssetItem.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@api.route('/assets', methods=['POST'])
@jwt_required()
def add_item():
    data = request.json
    # Validation
    if not data.get('supplier_name'):
        return jsonify({"error": "Supplier is mandatory"}), 400

    try:
        new_item = AssetItem(
            name=data.get('name'),
            asset_id=data.get('asset_id'),
            supplier_name=data['supplier_name'],
            quantity=int(data.get('quantity', 1)),
            price=float(data.get('price', 0.0)),
            serial=data.get('serial'),
            status=data.get('status', 'available'),
            assigned_to=data.get('assigned_to'),
            ip_address=data.get('ip_address'),
            mac_address=data.get('mac_address'),

            # ─── THE MISSING PIECES ────────────────────────────────
            # Map the IDs coming from your React dropdowns
            category_id=data.get('category_id'), 
            location_id=data.get('location_id'),
            # ───────────────────────────────────────────────────────

            # Convert string date to Python date object
            warranty_date=datetime.strptime(data['warranty_date'], '%Y-%m-%d').date() if data.get('warranty_date') else None
        )
        update_master_sheet(data['name'], 'Asset')
        db.session.add(new_item)
        
        # 2. Flush to get the ID for the audit log
        db.session.flush()

        # Log the action
        log = AuditLog(user_id=get_jwt_identity(), action=f"Created asset: {new_item.name}")
        db.session.add(log)
        
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"--- ❌ ASSET CREATE ERROR: {str(e)} ---")
        return jsonify({"error": str(e)}), 500

# ROUTE: Update an item's quantity or price
@api.route('/assets/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_asset_item(item_id): # Renamed to be safe
    item = AssetItem.query.get_or_404(item_id)
    data = request.get_json()

    try:
        # 1. Update Core Fields
        if 'name' in data: item.name = data['name']
        if 'asset_id' in data: item.asset_id = data['asset_id']
        if 'serial' in data: item.serial = data['serial']
        if 'status' in data: item.status = data['status']
        if 'assigned_to' in data: item.assigned_to = data['assigned_to']
        if 'quantity' in data: item.quantity = int(data['quantity'])
        if 'price' in data: item.price = float(data['price'])
        # 2. Update Relationships (IDs)
        if 'category_id' in data: item.category_id = data['category_id']
        if 'location_id' in data: item.location_id = data['location_id']

        # 3. Handle the Date object
        if 'warranty_date' in data and data['warranty_date']:
            item.warranty_date = datetime.strptime(data['warranty_date'], '%Y-%m-%d').date()

        db.session.commit()
        return jsonify(item.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ROUTE: Delete an item
@api.route('/assets/<int:item_id>', methods=['DELETE'])
@jwt_required() # <--- This line locks the door!
def delete_item(item_id):
    item = AssetItem.query.get_or_404(item_id)
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({"message": f"Item {item_id} deleted successfully"}), 200

# ROUTE: Delete an item (Admin Only)
@api.route('/assets/<int:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required # Only an admin can pass this check
def delete_inventory_item(item_id):
    item = AssetItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted by Admin"})

# ROUTE: Delete a user (Admin Only)
@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required # Only an admin can pass this check
def delete_system_user(user_id):
    user_to_delete = User.query.get_or_404(user_id)
    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({"message": f"User {user_to_delete.username} has been removed."})

# ROUTE: Register a new user (Run this once to create your account)
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # CHECK: Does this username already exist?
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already taken. Please choose another."}), 400

    # Logic to determine role (First user is Admin)
    is_first_user = User.query.count() == 0
    role = 'admin' if is_first_user else 'staff'
    
    new_user = User(username=username, role=role)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User created as {role}!"}), 201
    except Exception as e:
        db.session.rollback() # Undo the change if something goes wrong
        return jsonify({"message": "Database error", "error": str(e)}), 500

# ROUTE: Get all registered users (Admin Only)
@api.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    users = User.query.all()
    # We return id, username, and role, but NEVER the password_hash
    output = []
    for user in users:
        output.append({
            "id": user.id,
            "username": user.username,
            "role": user.role
        })
    return jsonify(output)

# ROUTE: Login to get a Token
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # 1. Find user (Using your existing User model)
    # user = User.query.filter_by(username=data['username']).first()
    
    # ─── THE FIX ────────────────────────────────────────────────
    # Change 'username' to 'email' to match your React Form
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # 2. Check password (using flask_bcrypt)
    # if user and flask_bcrypt.check_password_hash(user.password_hash, password):
    #     # 3. GENERATE REAL TOKEN
    #     # We store the user ID in the 'identity'
    #     access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
    #     return jsonify({
    #         "token": access_token,
    #         "user": user.to_dict()
    #     }), 200
    
    # Query using email, NOT username
    user = User.query.filter_by(email=email).first()
    # ────────────────────────────────────────────────────────────

    if user and flask_bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": access_token,
            "user": user.to_dict()
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@api.route('/categories', methods=['GET', 'POST'])
@jwt_required()
def handle_categories():
    # ─── USE CASE 1: RETRIEVE ALL (GET) ──────────────────────────
    if request.method == 'GET':
        try:
            categories = Category.query.all()
            # Uses the to_dict() we improved earlier to get counts
            return jsonify([c.to_dict() for c in categories]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch categories", "details": str(e)}), 500

    # ─── USE CASE 2: CREATE NEW (POST) ───────────────────────────
    if request.method == 'POST':
        data = request.get_json()
        print(f"DEBUG DATA RECEIVED: {data}")

        if not data or 'name' not in data:
            return jsonify({"error": "Category name is required"}), 400

        try:
            # 1. Check for duplicates
            if Category.query.filter_by(name=data.get('name').strip()).first():
                return jsonify({"error": f"Category '{data.get('name')}' already exists"}), 409

            # 2. Create the Category
            new_cat = Category(
                name=data.get('name').strip(),
                icon=data.get('icon', 'Tag'),
                color=data.get('color', 'primary')
            )
            db.session.add(new_cat)
            
            # 3. Flush to generate the ID for the log, but don't commit yet
            db.session.flush() 

            # 4. Audit Log Entry
            # Note: get_jwt_identity usually returns the user.id as a string
            log = AuditLog(
                user_id=int(get_jwt_identity()), 
                action=f"Created Category: {new_cat.name}"
            )
            db.session.add(log)
            
            # 5. Final Commit
            db.session.commit()
            return jsonify(new_cat.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            print(f"--- ❌ CATEGORY POST ERROR: {str(e)} ---")
            return jsonify({"error": "Database write failed", "details": str(e)}), 500

# --- UPDATE CATEGORY ---
@api.route('/categories/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    cat = Category.query.get_or_404(id)
    data = request.json
    try:
        cat.name = data.get('name', cat.name)
        cat.icon = data.get('icon', cat.icon)
        cat.color = data.get('color', cat.color)
        
        db.session.commit()
        return jsonify(cat.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- DELETE CATEGORY ---
@api.route('/categories/<int:cat_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category_by_id(cat_id):
    category = Category.query.get_or_404(cat_id)
    # The backref 'items' will automatically set category_id to NULL in AssetItem
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": f"Category '{category.name}' deleted successfully"}), 200

@api.route('/locations', methods=['GET', 'POST'])
@jwt_required()
def handle_locations():
    if request.method == 'GET':
        return jsonify([l.to_dict() for l in Location.query.all()]), 200

    if request.method == 'POST':
        data = request.get_json()
        # VALIDATION: Prevent "Ghost" locations with no name
        if not data.get('name'):
            return jsonify({"error": "Location name is required"}), 400
            
        new_loc = Location(
            name=data['name'],
            type=data.get('type', 'Site'),
            address=data.get('address', '') # Save the new address field
        )
        db.session.add(new_loc)
        db.session.commit()
        return jsonify(new_loc.to_dict()), 201

# --- DELETE LOCATION ---
@api.route('/locations/<int:loc_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_location_by_id(loc_id):
    # 1. Use .get() for custom JSON error handling
    location = Location.query.get(loc_id)

    # USE CASE: Resource Missing
    if not location:
        return jsonify({
            "error": "Location not found",
            "status": 404
        }), 404

    # 2. USE CASE: Dependency Check (The "Showstopper")
    # Check if any Assets are still linked to this location
    linked_assets_count = AssetItem.query.filter_by(location_id=loc_id).count()
    linked_consumables_count = Consumable.query.filter_by(location_id=loc_id).count()
    
    if linked_assets_count > 0:
        return jsonify({
            "error": "Conflict",
            "message": f"Cannot delete '{location.name}'. It is still linked to {linked_assets_count} assets and {linked_consumables_count} consumables.",
            "status": 409
        }), 409

    # 3. USE CASE: Safe Deletion
    try:
        location_name = location.name # Store name before object is deleted
        db.session.delete(location)
        db.session.commit()
        
        return jsonify({
            "message": f"Location '{location_name}' deleted successfully",
            "status": "success"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Database error",
            "details": str(e)
        }), 500

# ─── 1. FETCH ALL & ADD NEW ──────────────────────────────────────
@api.route('/consumables', methods=['GET', 'POST'])
@jwt_required()
def handle_consumables():
    if request.method == 'GET':
        try:
            items = Consumable.query.all()
            return jsonify([i.to_dict() for i in items]), 200
        except Exception as e:
            return jsonify({"error": "Fetch failed", "details": str(e)}), 500

    if request.method == 'POST':
        data = request.get_json()
        required = ['name', 'sku', 'supplier_name', 'quantity']
        if not data or not all(k in data for k in required):
            return jsonify({"error": "Missing fields", "required": required}), 400

        try:
            new_con = Consumable(
                name=data['name'].strip(),
                sku=data['sku'].strip().upper(),
                supplier_name=data['supplier_name'].strip(),
                quantity=int(data.get('quantity', 0)),
                min_threshold=int(data.get('min_threshold', 10)),
                category_id=data.get('category_id'),
                location_id=data.get('location_id')
            )
            update_master_sheet(new_con.name, 'Consumable')
            db.session.add(new_con)
            
            # Audit Trail
            log = AuditLog(user_id=int(get_jwt_identity()), action=f"Created Consumable: {new_con.name}")
            db.session.add(log)
            
            db.session.commit()
            return jsonify(new_con.to_dict()), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "SKU already exists"}), 409

# ─── 2. STOCK IN (ADD QUANTITY) ──────────────────────────────────
@api.route('/consumables/<int:con_id>/stock-in', methods=['POST'])
@jwt_required()
def stock_in_consumable(con_id):
    item = Consumable.query.get_or_404(con_id)
    data = request.get_json()
    qty_to_add = int(data.get('quantity', 0))
    reason = data.get('reason', 'N/A')

    if qty_to_add <= 0:
        return jsonify({"error": "Quantity must be positive"}), 400

    item.quantity += qty_to_add
    log = AuditLog(user_id=int(get_jwt_identity()), action=f"Stock In: {item.name} +{qty_to_add} ({reason})")
    db.session.add(log)
    
    db.session.commit()
    return jsonify(item.to_dict()), 200

# ─── 3. ISSUE STOCK (REMOVE QUANTITY) ────────────────────────────
@api.route('/consumables/<int:con_id>/issue', methods=['POST'])
@jwt_required()
def issue_consumable(con_id):
    item = Consumable.query.get_or_404(con_id)
    data = request.get_json()
    qty_to_issue = int(data.get('quantity', 0))
    issue_to = data.get('issued_to', 'Not specified')
    reason = data.get('reason', 'N/A')

    if qty_to_issue > item.quantity:
        return jsonify({"error": f"Insufficient stock. Only {item.quantity} available."}), 400

    item.quantity -= qty_to_issue
    log = AuditLog(user_id=int(get_jwt_identity()), action=f"Issued: {item.name} -{qty_to_issue} to {issue_to}")
    db.session.add(log)

    db.session.commit()
    return jsonify(item.to_dict()), 200

# ─── 4. EDIT DETAILS (PUT) ───────────────────────────────────────
@api.route('/consumables/<int:con_id>', methods=['PUT'])
@jwt_required()
def edit_consumable(con_id):
    item = Consumable.query.get_or_404(con_id)
    data = request.get_json()

    try:
        if 'name' in data: item.name = data['name'].strip()
        if 'sku' in data: item.sku = data['sku'].strip().upper()
        if 'supplier_name' in data: item.supplier_name = data['supplier_name']
        if 'min_threshold' in data: item.min_threshold = int(data['min_threshold'])
        if 'category_id' in data: item.category_id = data['category_id']
        if 'location_id' in data: item.location_id = data['location_id']

        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ─── 5. DELETION (ADMIN ONLY) ────────────────────────────────────
@api.route('/consumables/<int:con_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_consumable(con_id):
    item = Consumable.query.get_or_404(con_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200

# ─── SUPPLIER ROUTES ──────────────────────────────────────────────
@api.route('/suppliers', methods=['GET', 'POST'])
@jwt_required()
def handle_suppliers():
    if request.method == 'GET':
        suppliers = Supplier.query.all()
        return jsonify([s.to_dict() for s in Supplier.query.all()])
    
    if request.method == 'POST':
        data = request.get_json()
        if not data.get('name'):
            return jsonify({"error": "Supplier name is required"}), 400
            
        if Supplier.query.get(data['name']):
            return jsonify({"error": "Supplier already exists"}), 400

        new_sup = Supplier(
            name=data['name'],
            contact_person=data.get('contact_person'),
            email=data.get('email'),
            phone=data.get('phone')
        )
        db.session.add(new_sup)
        db.session.commit()
        return jsonify(new_sup.to_dict()), 201

@api.route('/suppliers/<string:name>', methods=['DELETE'])
@jwt_required()
def delete_supplier(name):
    sup = Supplier.query.get_or_404(name)
    # Check for linked items before deleting
    asset_count = AssetItem.query.filter_by(supplier_name=name).count()
    if asset_count > 0:
        return jsonify({"error": "Cannot delete supplier with linked assets"}), 400
        
    db.session.delete(sup)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200

@api.route('/report/monthly', methods=['GET'])
@jwt_required()
@admin_required # Reports are usually for admins
def download_monthly_report():
    # 1. Fetch all data from DB
    items = AssetItem.query.all()
    consumables = Consumable.query.all()

    # 2. Convert Asset data to a List of Dicts
    asset_data = [{
        "Name": i.name,
        "SKU": i.sku,
        "Quantity": i.quantity,
        "Price": i.price,
        "Total Value": i.quantity * i.price,
        "Location": i.location.name if i.location else "N/A",
        "Category": i.category.name if i.category else "N/A"
    } for i in items]

    # 3. Create a Pandas Dataframe
    df_assets = pd.DataFrame(asset_data)
    df_consumables = pd.DataFrame([c.to_dict() for c in consumables])

    # 4. Save to an "In-Memory" Excel file (so we don't clutter your hard drive)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_assets.to_excel(writer, index=False, sheet_name='Assets')
        df_consumables.to_excel(writer, index=False, sheet_name='Consumables')
    
    output.seek(0)

    # 5. Send the file to the user
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='Monthly_Inventory_Report.xlsx'
    )

# ─── MASTER SHEET (ADMIN ONLY) ────────────────────────────────────
@api.route('/admin/master-sheet', methods=['GET'])
@jwt_required()
@admin_required  # This decorator should already block non-admins
def get_master_sheet():
    try:
        # Fetch all unique items registered in the Master Sheet
        items = MasterItem.query.order_by(MasterItem.item_name.asc()).all()
        
        # If the list is empty, return an empty array with a 200 (not an error)
        return jsonify([i.to_dict() for i in items]), 200
        
    except Exception as e:
        return jsonify({"error": "Could not fetch Master Sheet", "details": str(e)}), 500

# ─── DASHBOARD STATS (For Summary Cards) ─────────────────────────────
@api.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Live counts from Supabase
        assets_count = AssetItem.query.count()
        locations_count = Location.query.count()
        
        # Safe sum: handle case where there are no consumables
        consumables_sum = db.session.query(func.sum(Consumable.quantity)).scalar()
        if consumables_sum is None:
            consumables_sum = 0
            
        # Items below or at threshold
        alerts_count = Consumable.query.filter(Consumable.quantity <= Consumable.min_threshold).count()

        return jsonify({
            "assets": assets_count,
            "consumables": int(consumables_sum),
            "locations": locations_count,
            "alerts": alerts_count
        }), 200
    except Exception as e:
        print(f"DASHBOARD ERROR: {str(e)}") # This shows up in your terminal
        return jsonify({"error": str(e)}), 500

# ─── DASHBOARD ALERTS (Top 5 Low Stock Items) ─────────────────────────────
@api.route('/dashboard/alerts', methods=['GET'])
@jwt_required()
def get_dashboard_alerts():
    # Fetch top 5 items that need attention
    low_stock_items = Consumable.query.filter(Consumable.quantity <= Consumable.min_threshold).limit(5).all()
    return jsonify([item.to_dict() for item in low_stock_items]), 200

@api.route('/dashboard/activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    try:
        # Fetch the 10 most recent logs, joined with user to get the name
        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(10).all()
        
        return jsonify([{
            "id": log.id,
            "action": log.action, # This should be the full description string
            "user": log.user.name if log.user else "System",
            "timestamp": log.timestamp.isoformat()
        } for log in logs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── ALL ACTIVITY LOGS (For Admins) ─────────────────────────────
@api.route('/logs', methods=['GET'])
@jwt_required()
def get_all_logs():
    try:
        # Fetch all logs, newest first
        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── GLOBAL SEARCH (Assets, Consumables, Locations) ─────────────────────────────
@api.route('/search', methods=['GET'])
@jwt_required()
def global_search():
    q = request.args.get('q', '').lower()
    if len(q) < 2: return jsonify([]), 200

    results = []

    # Search Assets
    assets = AssetItem.query.filter(
        (AssetItem.name.ilike(f'%{q}%')) | (AssetItem.asset_id.ilike(f'%{q}%'))
    ).limit(3).all()
    for a in assets:
        results.append({"type": "Asset", "name": a.name, "id": a.asset_id, "path": "/assets"})

    # Search Consumables
    consumables = Consumable.query.filter(Consumable.name.ilike(f'%{q}%')).limit(3).all()
    for c in consumables:
        results.append({"type": "Consumable", "name": c.name, "id": f"Qty: {c.quantity}", "path": "/consumables"})

    # Search Locations
    locations = Location.query.filter(Location.name.ilike(f'%{q}%')).limit(3).all()
    for l in locations:
        results.append({"type": "Location", "name": l.name, "id": "Site", "path": "/locations"})

    return jsonify(results), 200

# 6. Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)