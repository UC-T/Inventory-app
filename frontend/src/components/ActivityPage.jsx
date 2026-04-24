import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserCheck, Plus, MapPin, Edit, Trash2, Package, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logsAPI } from '../services/api';
import '../styling/ActivityPage.css';

// Icon mapping based on the action type returned by backend
const ICON_MAP = { 
  checkout: UserCheck, 
  checkin: Package, 
  create: Plus, 
  update: Edit, 
  delete: Trash2, 
  transfer: MapPin 
};

const ACTION_CONFIG = {
  checkout: { label: 'Checkout',  className: 'action--checkout' },
  checkin:  { label: 'Check In',  className: 'action--checkin'  },
  create:   { label: 'Create',    className: 'action--create'   },
  update:   { label: 'Update',    className: 'action--update'   },
  delete:   { label: 'Delete',    className: 'action--delete'   },
  transfer: { label: 'Transfer',  className: 'action--transfer' },
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function exportCSV(rows) {
  const header = 'ID,Action,Title,Description,User,Timestamp\n';
  const body   = rows.map(r =>
    `${r.id},"${r.action}","${r.title}","${r.description}","${r.user}","${r.timestamp}"`
  ).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ActivityPage() {
  const { can } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLoading(true);
    logsAPI.getAll()
      .then(data => {
        setLogs(data || []);
      })
      .catch(err => console.error("Log fetch failed", err))
      .finally(() => setLoading(false));
  };

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      log.title?.toLowerCase().includes(q) ||
      log.description?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q);
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchFrom   = !dateFrom || log.timestamp >= dateFrom;
    const matchTo     = !dateTo   || log.timestamp <= dateTo + ' 23:59:59';
    return matchSearch && matchAction && matchFrom && matchTo;
  });

  function clearFilters() {
    setSearch(''); setFilterAction('all'); setDateFrom(''); setDateTo('');
  }

  const hasActiveFilters = search || filterAction !== 'all' || dateFrom || dateTo;

  return (
    <div className="activity-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">Complete immutable audit trail — every action recorded</p>
        </div>
        {can('log_export') && (
          <button className="btn btn--secondary" onClick={() => exportCSV(filtered)}>
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input type="text" placeholder="Search logs..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>

        <div className="dropdown-wrap">
          <button className="btn btn--secondary" onClick={() => setShowFilter(p => !p)}>
            <Filter size={15} />
            {filterAction === 'all' ? 'All Actions' : ACTION_CONFIG[filterAction]?.label}
            <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="dropdown-menu">
              <button className={`dropdown-item ${filterAction === 'all' ? 'active' : ''}`}
                onClick={() => { setFilterAction('all'); setShowFilter(false); }}>All Actions</button>
              {Object.entries(ACTION_CONFIG).map(([v, { label }]) => (
                <button key={v}
                  className={`dropdown-item ${filterAction === v ? 'active' : ''}`}
                  onClick={() => { setFilterAction(v); setShowFilter(false); }}>
                  <span className={`log-action ${ACTION_CONFIG[v].className}`} style={{ fontSize: 10 }}>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="date-range">
          <input type="date" className="date-input" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} />
          <span className="date-sep">→</span>
          <input type="date" className="date-input" value={dateTo}
            onChange={e => setDateTo(e.target.value)} />
        </div>

        {hasActiveFilters && (
          <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}
        <span className="results-count">{filtered.length} of {logs.length} entries</span>
      </div>

      <div className="audit-notice">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Automated audit trail. These entries are immutable and for tracking purposes only.
      </div>

      {loading ? (
        <div className="activity-log">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="log-item skeleton-row" style={{ height: 80, marginBottom: 12, borderRadius: 8 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={32} style={{ opacity: .2 }} />
          <p>No log entries found.</p>
        </div>
      ) : (
        <div className="activity-log">
          {filtered.map(activity => {
            const config = ACTION_CONFIG[activity.action] || { label: activity.action, className: 'action--update' };
            const Icon   = ICON_MAP[activity.action] || Package;
            return (
              <div key={activity.id} className="log-item">
                <div className={`log-icon ${config.className}`}>
                  <Icon size={17} />
                </div>
                <div className="log-content">
                  <div className="log-header">
                    <span className={`log-action ${config.className}`}>{config.label}</span>
                    <span className="log-timestamp">{formatDate(activity.timestamp)}</span>
                  </div>
                  <h4 className="log-title">{activity.title}</h4>
                  <p className="log-description">{activity.description}</p>
                  <span className="log-user">by {activity.user}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityPage;