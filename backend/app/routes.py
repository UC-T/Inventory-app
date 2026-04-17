from flask import Flask, jsonify, request, Blueprint  # <--- Ensure Blueprint is here # 1. Imports first
# from .models import db, AssetItem
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from .models import db, AssetItem, User, flask_bcrypt, Category, Location, Consumable, AuditLog
from functools import wraps
from flask_jwt_extended import get_jwt_identity
import pandas as pd
from flask import send_file
from flask_cors import CORS
from datetime import timedelta, datetime
from sqlalchemy.exc import IntegrityError
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
    try:
        new_item = AssetItem(
            name=data.get('name'),
            asset_id=data.get('asset_id'),
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
def update_item(item_id):
    item = AssetItem.query.get_or_404(item_id)
    data = request.get_json()

    # Update only the fields provided in the request
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'price' in data:
        item.price = data['price']
    if 'name' in data:
        item.name = data['name']

    db.session.commit()
    return jsonify({"message": "Item updated!", "item": item.to_dict()})

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

# ROUTE: Get Dashboard Data (Protected)
@api.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    # 1. Fetch data
    items = AssetItem.query.all()
    consumables = Consumable.query.all()
    
    # 2. Logic for Low Stock Alerts
    alerts = []
    for item in items:
        if item.quantity < 5: # Threshold for assets
            alerts.append({"type": "Asset", "name": item.name, "qty": item.quantity})
            
    for con in consumables:
        if con.quantity <= con.min_threshold:
            alerts.append({"type": "Consumable", "name": con.name, "qty": con.quantity})

    # 3. Structure the response
    return jsonify({
        "summary": {
            "total_assets": len(items),
            "total_consumables": len(consumables),
            "total_alerts": len(alerts)
        },
        "alerts": alerts,
        "recent_assets": [i.to_dict() for i in items[-5:]] # Show last 5 added
    })

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

@api.route('/consumables', methods=['GET', 'POST'])
@jwt_required()
def handle_consumables():
    # ─── USE CASE 1: RETRIEVE ALL (GET) ──────────────────────────
    if request.method == 'GET':
        try:
            items = Consumable.query.all()
            # ─── DEBUG PRINT ────────────────────────────────────
            print(f"--- 📦 DATABASE FETCH: Found {len(items)} items in Supabase ---")
            # ────────────────────────────────────────────────────
            # Standardized to_dict() handles the conversion
            return jsonify([i.to_dict() for i in items]), 200
        except Exception as e:
            print(f"--- ❌ GET CONSUMABLES FAILED: {str(e)} ---")
            return jsonify({"error": str(e)}), 500

    # ─── USE CASE 2: ADD NEW (POST) ──────────────────────────────
    if request.method == 'POST':
        data = request.get_json()

        # Validation: Standardizing keys
        # We now accept 'min_threshold' directly from the frontend
        required = ['name', 'sku', 'quantity']
        if not data or not all(k in data for k in required):
            return jsonify({"error": "Missing required fields", "required": required}), 400

        try:
            # Type Casting and Validation
            qty = int(data.get('quantity', 0))
            # Fallback for threshold to ensure no crash if field is named 'minStock'
            threshold = int(data.get('min_threshold', data.get('minStock', 5)))

            new_con = Consumable(
                name=data['name'].strip(),
                sku=data['sku'].strip().upper(),
                quantity=qty,
                min_threshold=threshold,
                category_id=data.get('category_id'),
                location_id=data.get('location_id')
            )

            db.session.add(new_con)
            
            # Audit Trail
            log = AuditLog(
                user_id=int(get_jwt_identity()),
                action=f"Added Consumable: {new_con.name} (Qty: {qty})"
            )
            db.session.add(log)
            
            db.session.commit()
            return jsonify(new_con.to_dict()), 201

        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Duplicate entry: Name or SKU already exists"}), 409
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Database error", "details": str(e)}), 500

# ─── DELETE ENTIRE ITEM (ADMIN ONLY) ──────────────────────────────
@api.route('/consumables/<int:con_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_consumable_by_id(con_id):
    # .get_or_404 already handles the "if not consumable" check automatically
    consumable = Consumable.query.get_or_404(con_id)
    
    name_cache = consumable.name
    db.session.delete(consumable)
    db.session.commit()
    
    return jsonify({
        "message": f"Consumable '{name_cache}' completely removed from database"
    }), 200

@api.route('/consumables/bulk-delete', methods=['POST'])
@jwt_required()
@admin_required
def bulk_delete_consumables():
    data = request.get_json()
    ids = data.get('ids', []) # Expected format: {"ids": [1, 2, 5]}
    
    if not ids:
        return jsonify({"error": "No IDs provided"}), 400
        
    deleted_count = Consumable.query.filter(Consumable.id.in_(ids)).delete(synchronize_session=False)
    db.session.commit()
    
    return jsonify({"message": f"Successfully deleted {deleted_count} items"}), 200

# ─── DELETE BY QUANTITY (ISSUE / REDUCE STOCK) ───────────────────
@api.route('/consumables/<int:con_id>/reduce', methods=['POST'])
@jwt_required()
def update_consumable(con_id):
    item = Consumable.query.get_or_404(con_id)
    data = request.get_json()

    try:
        # Update fields if they exist in the request
        if 'name' in data: item.name = data['name'].strip()
        if 'sku' in data: item.sku = data['sku'].strip().upper()
        if 'quantity' in data: item.quantity = int(data['quantity'])
        
        # Consistent mapping for threshold
        if 'min_threshold' in data or 'minStock' in data:
            item.min_threshold = int(data.get('min_threshold', data.get('minStock')))

        if 'category_id' in data: item.category_id = data['category_id']
        if 'location_id' in data: item.location_id = data['location_id']

        db.session.commit()
        return jsonify(item.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Update failed", "details": str(e)}), 500

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

# --- ROUTE TO SETUP DUMMY DATA (For Testing) ---

# 6. Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)