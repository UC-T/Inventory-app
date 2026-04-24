import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Package, X, ArrowDown, ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { consumablesAPI, categoriesAPI, locationsAPI, suppliersAPI } from '../services/api';
import '../styling/ConsumablesPage.css';

// ─── UTILS ────────────────────────────────────────────────────────
function getStockStatus(quantity, min_threshold) {
  if (quantity <= 0)           return { label: 'Out of Stock', cls: 'stock--out' };
  if (quantity < min_threshold)   return { label: 'Low Stock',     cls: 'stock--low' };
  if (quantity < min_threshold * 1.5) return { label: 'Medium',      cls: 'stock--medium' };
  return                            { label: 'In Stock',      cls: 'stock--ok' };
}

// ─── Stock-In Modal ───────────────────────────────────────────────
function StockInModal({ item, onClose, onSave }) {
  const [qty, setQty]       = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  async function handleSave() {
    const n = parseInt(qty, 10);
    if (!n || n <= 0) { setErr('Enter a valid quantity greater than 0'); return; }
    setSaving(true);
    try {
      const updatedItem = await consumablesAPI.stockIn(item.id, { quantity: n, reason });
    
      // Check if updatedItem actually exists before calling onSave
      if (updatedItem) {
        onSave(updatedItem); 
      } else {
        throw new Error("Empty response from server");
      }
    } catch (error) {
      setErr('Failed to update stock in Supabase');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Stock In</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="modal-item-name">{item.name}</p>
        <p className="modal-item-meta">Current stock: <strong>{item.quantity}</strong> units</p>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Quantity to add *</label>
          <input type="number" min="1" className={`form-input ${err ? 'form-input--error' : ''}`}
            placeholder="e.g. 50" value={qty} onChange={e => { setQty(e.target.value); setErr(''); }} />
          {err && <span className="form-error">{err}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Reason / Reference</label>
          <input className="form-input" placeholder="e.g. PO#12345, supplier restock"
            value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary btn--success" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : <><ArrowDown size={14} /> Add Stock</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Issue Modal ──────────────────────────────────────────────────
function IssueModal({ item, onClose, onSave }) {
  const [qty, setQty]         = useState('');
  const [reason, setReason]   = useState('');
  const [issueTo, setIssueTo] = useState('');
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  async function handleSave() {
    const n = parseInt(qty, 10);
    if (!n || n <= 0)     { setErr('Enter a valid quantity'); return; }
    if (n > item.quantity){ setErr(`Cannot issue more than current stock (${item.quantity})`); return; }
    setSaving(true);
    try {
      const updatedItem = await consumablesAPI.issue(item.id, { quantity: n, reason, issued_to: issueTo });
    
      // Check if updatedItem actually exists before calling onSave
      if (updatedItem) {
        onSave(updatedItem); 
      } else {
        throw new Error("Empty response from server");
      }
    } catch (error) {
      setErr('Failed to issue stock from Supabase');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Issue Stock</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="modal-item-name">{item.name}</p>
        <p className="modal-item-meta">Available: <strong>{item.quantity}</strong> units</p>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Quantity to issue *</label>
          <input type="number" min="1" max={item.quantity}
            className={`form-input ${err ? 'form-input--error' : ''}`}
            placeholder="e.g. 10" value={qty}
            onChange={e => { setQty(e.target.value); setErr(''); }} />
          {err && <span className="form-error">{err}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Issue to (person / team)</label>
          <input className="form-input" placeholder="e.g. John Davidson"
            value={issueTo} onChange={e => setIssueTo(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Reason / Job reference</label>
          <input className="form-input" placeholder="e.g. Site #12 installation"
            value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--warning" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : <><ArrowUp size={14} /> Issue Stock</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Consumable Modal ──────────────────────────────────
function ConsumableModal({ item, categories, locations, suppliers, onClose, onSave }) {
  const isEdit = !!item;

  const [form, setForm] = useState(() => {
    if (!item) return { name:'', sku:'', quantity:0, min_threshold:10, category_id:'', location_id:'', supplier_name:'' };
    
    // EXTRACTION LOGIC: ensure we get the ID whether it's flat or nested
    let catId = item.category_id || '';
    if (!catId && item.category) {
      const match = categories.find(c => c.name === item.category);
      if (match) catId = match.id;
    }

    // 2. Find Location ID by matching the name if location_id is missing
    let locId = item.location_id || '';
    if (!locId && item.location) {
      const match = locations.find(l => l.name === item.location);
      if (match) locId = match.id;
    }

    return {
      ...item,
      category_id: catId ? String(catId) : '',
      location_id: locId ? String(locId) : '',
      supplier_name: item.supplier_name || item.supplier?.name || 'Unassigned'
    };
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim())  e.sku  = 'SKU is required';
    if (!form.supplier_name) e.supplier_name = 'Supplier is mandatory';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        // Ensure numeric types for Supabase/Postgres
        quantity: parseInt(form.quantity) || 0,
        min_threshold: parseInt(form.min_threshold) || 10,
        // Send IDs as integers if your backend expects them that way
        category_id: form.category_id ? parseInt(form.category_id) : null,
        location_id: form.location_id ? parseInt(form.location_id) : null
      };
      const result = isEdit
        ? await consumablesAPI.update(item.id, payload)
        : await consumablesAPI.create(payload);
      onSave(result);
    } catch (err) {
      setErrors({ server: "Failed to sync with Supabase" });
    } finally {
      setSaving(false);
    }
  }

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Item' : 'Add Stock Item'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="e.g. RG-6 Coax Cable" value={form.name}
              onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input className={`form-input ${errors.sku ? 'form-input--error' : ''}`}
              placeholder="e.g. CBL-RG6-1K" value={form.sku}
              onChange={e => set('sku', e.target.value)} />
            {errors.sku && <span className="form-error">{errors.sku}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Supplier *</label>
            <select className={`form-select ${errors.supplier_name ? 'form-input--error' : ''}`} 
              value={form.supplier_name} onChange={e => set('supplier_name', e.target.value)}>
              <option value="">Select Supplier...</option>
              {(suppliers || []).map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.supplier_name && <span className="form-error">{errors.supplier_name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Min Stock Threshold</label>
            <input type="number" min="1" className="form-input" value={form.min_threshold}
              onChange={e => set('min_threshold', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select" 
              value={String(form.category_id || '')} 
              onChange={e => set('category_id', e.target.value)}
            >
              <option value="">Select Category...</option>
              {categories.map(c => (
                <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <select 
              className="form-select" 
              value={String(form.location_id || '')} 
              onChange={e => set('location_id', e.target.value)}
            >
              <option value="">Select Location...</option>
              {locations.map(l => (
                <option key={String(l.id)} value={String(l.id)}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {!isEdit && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input type="number" min="0" className="form-input" value={form.quantity}
                onChange={e => set('quantity', e.target.value)} />
            </div>
            <div className="form-group" />
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
function ConsumablesPage() {
  const { can } = useAuth();

  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [suppliers,  setSuppliers]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [addModal,     setAddModal]     = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [stockInItem,  setStockInItem] = useState(null);
  const [issueItem,    setIssueItem]    = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cData, catData, locData, supData] = await Promise.all([
          consumablesAPI.getAll(),
          categoriesAPI.getAll(),
          locationsAPI.getAll(),
          suppliersAPI.getAll()
        ]);
        setItems(cData || []);
        setCategories(catData || []);
        setLocations(locData || []);
        setSuppliers(supData || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.supplier_name?.toLowerCase().includes(q);
    
    const status = getStockStatus(item.quantity, item.min_threshold).cls;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'low'   && (status === 'stock--low' || status === 'stock--out')) ||
      (filterStatus === 'ok'    && status === 'stock--ok');
    return matchSearch && matchStatus;
  });

  function handleSaved(saved) {
    setItems(prev => {
      const exists = prev.find(i => i.id === saved.id);
      return exists ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev];
    });
    setAddModal(false);
    setEditItem(null);
    setStockInItem(null);
    setIssueItem(null);
  }

  const lowCount = items.filter(i => i.is_low_stock).length;

  return (
    <div className="consumables-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumables</h1>
          <p className="page-subtitle">
            Track quantity-based inventory and stock levels
            {lowCount > 0 && <span className="low-stock-badge"> · {lowCount} item{lowCount > 1 ? 's' : ''} need restocking</span>}
          </p>
        </div>
        {can('consumable_create') && (
          <button className="btn btn--primary" onClick={() => setAddModal(true)}>
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search items, SKU, supplier…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>

        <div className="filter-group">
          {[['all','All'],['low','Low / Out'],['ok','In Stock']].map(([v,l]) => (
            <button key={v}
              className={`filter-pill ${filterStatus === v ? 'filter-pill--active' : ''}`}
              onClick={() => setFilterStatus(v)}>{l}
            </button>
          ))}
        </div>

        <span className="results-count">{filtered.length} of {items.length}</span>
      </div>

      {loading ? (
        <div className="consumables-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div className="consumables-grid">
          {filtered.map(item => {
            const isLow = item.is_low_stock; 
            const statusData = getStockStatus(item.quantity, item.min_threshold);
            const label = statusData.label;
            const cls = statusData.cls;
            const pct = Math.min(100, Math.round((item.quantity / (item.min_threshold * 2)) * 100));

            return (
              <div key={item.id} className={`consumable-card ${isLow ? 'consumable-card--warning' : ''}`}>
                <div className="consumable-header">
                  <div className="consumable-icon"><Package size={20} /></div>
                  {isLow && (
                    <div className="consumable-alert" title="Low stock alert">
                      <AlertTriangle size={15} />
                    </div>
                  )}
                </div>

                <h3 className="consumable-name">{item.name}</h3>
                <span className="consumable-sku">{item.sku}</span>
                <span className="consumable-supplier" style={{fontSize: '12px', color: 'var(--color-text-secondary)'}}>
                  {item.supplier?.name || item.supplier_name || 'N/A'}
                </span>

                <div className="consumable-quantity">
                  <span className="quantity-value">{item.quantity}</span>
                  <span className="quantity-label">units</span>
                </div>

                <div className="stock-bar-container">
                  <div className={`stock-bar ${cls}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="consumable-footer">
                  <span className={`stock-status ${cls}`}>{label}</span>
                  <span className="min-stock">Min: {item.min_threshold}</span>
                </div>

                <div className="consumable-meta">
                  <span>{item.category}</span>
                  <span>{item.location}</span>
                </div>

                <div className="consumable-actions">
                  {can('consumable_stockin') && (
                    <button className="btn btn--secondary btn--sm c-action"
                      onClick={() => setStockInItem(item)}>
                      <ArrowDown size={13} /> Stock In
                    </button>
                  )}
                  {can('consumable_issue') && (
                    <button className="btn btn--secondary btn--sm c-action"
                      onClick={() => setIssueItem(item)}
                      disabled={item.quantity <= 0}>
                      <ArrowUp size={13} /> Issue
                    </button>
                  )}
                  {can('consumable_create') && (
                    <button className="btn btn--ghost btn--sm c-action"
                      onClick={() => setEditItem(item)}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addModal    && <ConsumableModal categories={categories} locations={locations} suppliers={suppliers} onClose={() => setAddModal(false)}  onSave={handleSaved} />}
      {editItem    && <ConsumableModal item={editItem} categories={categories} locations={locations} suppliers={suppliers} onClose={() => setEditItem(null)} onSave={handleSaved} />}
      {stockInItem && <StockInModal  item={stockInItem} onClose={() => setStockInItem(null)} onSave={handleSaved} />}
      {issueItem   && <IssueModal    item={issueItem}   onClose={() => setIssueItem(null)}   onSave={handleSaved} />}
    </div>
  );
}

export default ConsumablesPage;