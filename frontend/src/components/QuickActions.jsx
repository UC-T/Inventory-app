import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styling/QuickActions.css';

function QuickActions() {
  const navigate      = useNavigate();
  const { can }       = useAuth();

  function exportAllCSV() {
    // Navigates to activity log with export triggered
    navigate('/activity');
  }

  return (
    <div className="quick-actions">
      {can('asset_create') && (
        <button className="quick-action-btn quick-action-btn--primary"
          onClick={() => navigate('/assets')}>
          <Plus size={17} />
          <span>Add Assets</span>
        </button>
      )}
      {can('asset_qr') && (
        <button className="quick-action-btn quick-action-btn--secondary"
          onClick={() => navigate('/assets')}>
          <QrCode size={17} />
          <span>Scan QR</span>
        </button>
      )}
      {can('log_view') && (
        <button className="quick-action-btn quick-action-btn--secondary"
          onClick={() => navigate('/activity')}>
          <FileText size={17} />
          <span>Activity</span>
        </button>
      )}
      {can('log_export') && (
        <button className="quick-action-btn quick-action-btn--secondary"
          onClick={exportAllCSV}>
          <Download size={17} />
          <span>Export</span>
        </button>
      )}
    </div>
  );
}

export default QuickActions;