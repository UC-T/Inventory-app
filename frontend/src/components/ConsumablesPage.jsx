import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Package, X, ArrowDown, ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { consumablesAPI } from '../services/api';
import '../styling/ConsumablesPage.css';

// const MOCK_CONSUMABLES = [
//   { id: 1, name: 'RG-6 Coax Cable (1000ft)', sku: 'CBL-RG6-1K',   quantity: 2,  minStock: 5,  category: 'Cables',      location: 'Warehouse A' },
//   { id: 2, name: 'BNC Connectors (100pk)',   sku: 'CON-BNC-100',  quantity: 45, minStock: 20, category: 'Connectors',  location: 'Warehouse A' },
//   { id: 3, name: 'Cat6 Cable (500ft)',        sku: 'CBL-CAT6-500', quantity: 8,  minStock: 10, category: 'Cables',      location: 'Warehouse B' },
//   { id: 4, name: 'Power Supply 12V 2A',       sku: 'PWR-12V-2A',   quantity: 32, minStock: 15, category: 'Power',       location: 'Warehouse A' },
//   { id: 5, name: 'Mounting Brackets',         sku: 'MNT-BRK-UNI', quantity: 78, minStock: 25, category: 'Hardware',    location: 'Warehouse A' },
//   { id: 6, name: 'Weatherproof Junction Box', sku: 'BOX-WP-SM',   quantity: 12, minStock: 20, category: 'Enclosures',  location: 'Warehouse B' },
// ];

function getStockStatus(quantity, minStock) {
  if (quantity <= 0)         return { label: 'Out of Stock', cls: 'stock--out' };
  if (quantity < minStock)   return { label: 'Low Stock',    cls: 'stock--low' };
  if (quantity < minStock*1.5) return { label: 'Medium',     cls: 'stock--medium' };
  return                            { label: 'In Stock',     cls: 'stock--ok' };
}

function getStockPct(qty, min) {
  return Math.min(100, Math.round((qty / (min * 2)) * 100));
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
      await consumablesAPI.stockIn(item.id, { quantity: n, reason });
    } catch { /* mock */ }
    onSave(item.id, n, 'in', reason);
    setSaving(false);
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
      await consumablesAPI.issue(item.id, { quantity: n, reason, issued_to: issueTo });
    } catch { /* mock */ }
    onSave(item.id, n, 'out', reason);
    setSaving(false);
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
function ConsumableModal({ item, onClose, onSave }) {
  const isEdit = !!item;
  const [form, setForm] = useState(item || { name:'', sku:'', quantity:0, minStock:10, category:'', location:'' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim())  e.sku  = 'SKU is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit
        ? await consumablesAPI.update(item.id, form)
        : await consumablesAPI.create(form);
      onSave(result);
    } catch {
      onSave({ ...form, id: Date.now() });
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
            <label className="form-label">Initial Quantity</label>
            <input type="number" min="0" className="form-input" value={form.quantity}
              onChange={e => set('quantity', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Stock Threshold</label>
            <input type="number" min="1" className="form-input" value={form.minStock}
              onChange={e => set('minStock', parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select…</option>
              {['Cables','Connectors','Power','Hardware','Enclosures','Network','Tools'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <select className="form-select" value={form.location} onChange={e => set('location', e.target.value)}>
              <option value="">Select…</option>
              {['Warehouse A','Warehouse B','Service Center'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

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

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [addModal,     setAddModal]    = useState(false);
  const [editItem,     setEditItem]    = useState(null);
  const [stockInItem,  setStockInItem] = useState(null);
  const [issueItem,    setIssueItem]   = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await consumablesAPI.getAll();
        setItems(data);
      } catch { /* keep mock */ }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    const status = getStockStatus(item.quantity, item.minStock).cls;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'low'  && (status === 'stock--low' || status === 'stock--out')) ||
      (filterStatus === 'ok'   && status === 'stock--ok');
    return matchSearch && matchStatus;
  });

  function handleStockChange(id, qty, direction) {
    setItems(prev => prev.map(i =>
      i.id === id
        ? { ...i, quantity: direction === 'in' ? i.quantity + qty : Math.max(0, i.quantity - qty) }
        : i
    ));
    setStockInItem(null);
    setIssueItem(null);
  }

  function handleSaved(saved) {
    setItems(prev => {
      const exists = prev.find(i => i.id === saved.id);
      return exists ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev];
    });
    setAddModal(false);
    setEditItem(null);
  }

  const lowCount = items.filter(i => i.quantity < i.minStock).length;

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
          <input type="text" placeholder="Search items, SKU, category…"
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
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package size={32} style={{ opacity: 0.2 }} />
          <p>No items match your search</p>
        </div>
      ) : (
        <div className="consumables-grid">
          {filtered.map(item => {
            // 1. USE BACKEND LOGIC: We replace 'getStockStatus' and 'getStockPct' 
            // with the real data from your Python to_dict()
            const isLow = item.is_low_stock; 
            const label = isLow ? (item.quantity <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';
            const cls = isLow ? (item.quantity <= 0 ? 'stock--out' : 'stock--low') : 'stock--ok';
            
            // Keep the visual percentage for the UI bar
            const pct = Math.min(100, Math.round((item.quantity / (item.minStock * 2)) * 100));

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

                <div className="consumable-quantity">
                  <span className="quantity-value">{item.quantity}</span>
                  <span className="quantity-label">units</span>
                </div>

                {/* UI PROGRESS BAR: Restored exactly as v0 intended */}
                <div className="stock-bar-container">
                  <div className={`stock-bar ${cls}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="consumable-footer">
                  {/* UPDATED STATUS: Driven by backend 'is_low_stock' */}
                  <span className={`stock-status ${cls}`}>{label}</span>
                  <span className="min-stock">Min: {item.minStock}</span>
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

      {addModal    && <ConsumableModal onClose={() => setAddModal(false)}  onSave={handleSaved} />}
      {editItem    && <ConsumableModal item={editItem} onClose={() => setEditItem(null)} onSave={handleSaved} />}
      {stockInItem && <StockInModal  item={stockInItem} onClose={() => setStockInItem(null)} onSave={handleStockChange} />}
      {issueItem   && <IssueModal    item={issueItem}   onClose={() => setIssueItem(null)}   onSave={handleStockChange} />}
    </div>
  );
}

export default ConsumablesPage;