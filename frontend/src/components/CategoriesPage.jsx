import React, { useState, useEffect } from 'react';
import { Plus, Camera, HardDrive, Monitor, Cable, Cpu, Wrench, Box, Shield, Edit, Trash2, X, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI } from '../services/api';
import '../styling/CategoriesPage.css';

const ICON_MAP = { Camera, HardDrive, Monitor, Cable, Cpu, Wrench, Box, Shield, Tag };
const COLOR_OPTIONS = ['primary','info','success','warning'];
const ICON_OPTIONS  = Object.keys(ICON_MAP);

const MOCK_CATEGORIES = [
  { id: 1, name: 'Cameras',        icon: 'Camera',    assetCount: 156, consumableCount: 0,   color: 'primary' },
  { id: 2, name: 'Recording',      icon: 'HardDrive', assetCount: 48,  consumableCount: 24,  color: 'info'    },
  { id: 3, name: 'Displays',       icon: 'Monitor',   assetCount: 32,  consumableCount: 0,   color: 'success' },
  { id: 4, name: 'Cables',         icon: 'Cable',     assetCount: 0,   consumableCount: 890, color: 'warning' },
  { id: 5, name: 'Network',        icon: 'Cpu',       assetCount: 67,  consumableCount: 156, color: 'primary' },
  { id: 6, name: 'Tools',          icon: 'Wrench',    assetCount: 45,  consumableCount: 234, color: 'info'    },
  { id: 7, name: 'Enclosures',     icon: 'Box',       assetCount: 0,   consumableCount: 312, color: 'success' },
  { id: 8, name: 'Access Control', icon: 'Shield',    assetCount: 89,  consumableCount: 67,  color: 'warning' },
];

const EMPTY_FORM = { name: '', icon: 'Tag', color: 'primary' };

// ─── Add / Edit Modal ─────────────────────────────────────────────
function CategoryModal({ category, onClose, onSave }) {
  const isEdit = !!category;
  const [form, setForm]     = useState(category ? { name: category.name, icon: category.icon, color: category.color } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit
        ? await categoriesAPI.update(category.id, form)
        : await categoriesAPI.create(form);
      onSave(result);
    } catch {
      onSave({ ...form, id: Date.now(), assetCount: 0, consumableCount: 0 });
    } finally {
      setSaving(false);
    }
  }

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  const PreviewIcon = ICON_MAP[form.icon] || Tag;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Live preview */}
        <div className="cat-preview">
          <div className={`category-icon category-icon--${form.color}`}>
            <PreviewIcon size={24} />
          </div>
          <span className="cat-preview__name">{form.name || 'Category Name'}</span>
        </div>

        <div className="form-group">
          <label className="form-label">Category Name *</label>
          <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            placeholder="e.g. Cameras" value={form.name}
            onChange={e => set('name', e.target.value)} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Icon</label>
          <div className="icon-picker">
            {ICON_OPTIONS.map(name => {
              const Icon = ICON_MAP[name];
              return (
                <button key={name} type="button"
                  className={`icon-option ${form.icon === name ? 'icon-option--active' : ''}`}
                  onClick={() => set('icon', name)} title={name}>
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLOR_OPTIONS.map(c => (
              <button key={c} type="button"
                className={`color-option color-option--${c} ${form.color === c ? 'color-option--active' : ''}`}
                onClick={() => set('color', c)} title={c} />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({ category, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try { await categoriesAPI.delete(category.id); } catch {}
    onConfirm(category.id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Category</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="modal-body-text">
          Delete <strong>{category.name}</strong>?
          Assets and consumables in this category will become uncategorised.
        </p>
        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger-solid" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
function CategoriesPage() {
  const { can } = useAuth();
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [search,     setSearch]     = useState('');
  const [addModal,   setAddModal]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    categoriesAPI.getAll().then(setCategories).catch(() => {});
  }, []);

  const filtered = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSaved(saved) {
    setCategories(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
    });
    setAddModal(false);
    setEditItem(null);
  }

  function handleDeleted(id) {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteItem(null);
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organise assets and consumables by type</p>
        </div>
        {can('category_manage') && (
          <button className="btn btn--primary" onClick={() => setAddModal(true)}>
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Tag size={15} className="search-icon" />
          <input type="text" placeholder="Search categories…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
        <span className="results-count">{filtered.length} categories</span>
      </div>

      <div className="categories-grid">
        {filtered.map(category => {
          const Icon  = ICON_MAP[category.icon] || Tag;
          const total = (category.assetCount || 0) + (category.consumableCount || 0);
          return (
            <div key={category.id} className="category-card">
              {can('category_manage') && (
                <div className="category-card-actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditItem(category)}>
                    <Edit size={13} />
                  </button>
                  <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setDeleteItem(category)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              <div className={`category-icon category-icon--${category.color}`}>
                <Icon size={24} />
              </div>
              <h3 className="category-name">{category.name}</h3>
              <div className="category-count">
                <span className="count-value">{total}</span>
                <span className="count-label">Total Items</span>
              </div>
              <div className="category-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-value">{category.assetCount || 0}</span>
                  <span className="breakdown-label">Assets</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-item">
                  <span className="breakdown-value">{category.consumableCount || 0}</span>
                  <span className="breakdown-label">Consumables</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addModal   && <CategoryModal onClose={() => setAddModal(false)} onSave={handleSaved} />}
      {editItem   && <CategoryModal category={editItem} onClose={() => setEditItem(null)} onSave={handleSaved} />}
      {deleteItem && <DeleteConfirm category={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleted} />}
    </div>
  );
}

export default CategoriesPage;