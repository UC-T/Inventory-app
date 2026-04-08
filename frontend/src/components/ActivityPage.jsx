import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserCheck, Plus, MapPin, Edit, Trash2, Package, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logsAPI } from '../services/api';
import '../styling/ActivityPage.css';

const MOCK_ACTIVITIES = [
  { id: 1,  action: 'checkout',  title: 'Asset Checked Out',    description: 'PTZ Camera #CAM-0042 assigned to John Davidson',       user: 'Sarah Miller', timestamp: '2024-01-15 14:32:00', icon: 'UserCheck' },
  { id: 2,  action: 'create',    title: 'New Asset Added',       description: 'Thermal Imaging Camera added to inventory',            user: 'Admin User',   timestamp: '2024-01-15 13:45:00', icon: 'Plus'      },
  { id: 3,  action: 'transfer',  title: 'Location Transfer',     description: '15 items moved from Warehouse A to Site #12',          user: 'Mike Johnson', timestamp: '2024-01-15 11:20:00', icon: 'MapPin'    },
  { id: 4,  action: 'update',    title: 'Inventory Updated',     description: 'RG-6 Coax Cable quantity adjusted (−50 units)',         user: 'Sarah Miller', timestamp: '2024-01-15 10:15:00', icon: 'Edit'      },
  { id: 5,  action: 'delete',    title: 'Asset Decommissioned',  description: 'Old DVR Unit #DVR-0012 marked as disposed',            user: 'Admin User',   timestamp: '2024-01-15 09:30:00', icon: 'Trash2'    },
  { id: 6,  action: 'checkin',   title: 'Asset Returned',        description: 'Dome Camera #CAM-0038 returned by Tech Team',          user: 'Mike Johnson', timestamp: '2024-01-14 16:45:00', icon: 'Package'   },
  { id: 7,  action: 'create',    title: 'New Location Added',    description: 'Site #15 — Medical Center added to locations',         user: 'Admin User',   timestamp: '2024-01-14 14:20:00', icon: 'Plus'      },
  { id: 8,  action: 'update',    title: 'Asset Updated',         description: 'Warranty info updated for Network DVR #DVR-0015',      user: 'Sarah Miller', timestamp: '2024-01-14 11:00:00', icon: 'Edit'      },
  { id: 9,  action: 'checkout',  title: 'Asset Checked Out',     description: 'Thermal Camera #CAM-0044 deployed to Site #8',         user: 'Admin User',   timestamp: '2024-01-13 09:10:00', icon: 'UserCheck' },
  { id: 10, action: 'delete',    title: 'Stock Item Removed',    description: 'Expired Power Supply PSU-0009 removed from inventory', user: 'Mike Johnson', timestamp: '2024-01-12 15:00:00', icon: 'Trash2'    },
];

const ICON_MAP = { UserCheck, Plus, MapPin, Edit, Trash2, Package };

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
  const [logs,         setLogs]         = useState(MOCK_ACTIVITIES);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [showFilter,   setShowFilter]   = useState(false);
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');

  useEffect(() => {
    setLoading(true);
    logsAPI.getAll()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      log.title.toLowerCase().includes(q)       ||
      log.description.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q);
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

      {/* Toolbar */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input type="text" placeholder="Search by title, description, user…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>

        {/* Action filter dropdown */}
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

        {/* Date range */}
        <div className="date-range">
          <input type="date" className="date-input" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} title="From date" />
          <span className="date-sep">→</span>
          <input type="date" className="date-input" value={dateTo}
            onChange={e => setDateTo(e.target.value)} title="To date" />
        </div>

        {hasActiveFilters && (
          <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}

        <span className="results-count">{filtered.length} of {logs.length} entries</span>
      </div>

      {/* Readonly notice */}
      <div className="audit-notice">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        This log is read-only. Entries are written automatically and cannot be edited or deleted.
      </div>

      {/* Log list */}
      {loading ? (
        <div className="activity-log">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="log-item">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 14, width: '30%' }} />
                <div className="skeleton" style={{ height: 12, width: '70%' }} />
                <div className="skeleton" style={{ height: 11, width: '20%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={32} style={{ opacity: .2 }} />
          <p>No log entries match your filters</p>
          {hasActiveFilters && <button className="btn btn--secondary" onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : (
        <div className="activity-log">
          {filtered.map(activity => {
            const config = ACTION_CONFIG[activity.action] || { label: activity.action, className: '' };
            const Icon   = ICON_MAP[activity.icon] || Package;
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