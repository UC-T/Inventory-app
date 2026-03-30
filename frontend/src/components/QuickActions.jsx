import React from 'react';
import { Plus, QrCode, FileText, Download } from 'lucide-react';
import '../styling/QuickActions.css';

const actions = [
  { id: 1, label: 'Add Asset', icon: Plus, variant: 'primary' },
  { id: 2, label: 'Scan QR', icon: QrCode, variant: 'secondary' },
  { id: 3, label: 'Reports', icon: FileText, variant: 'secondary' },
  { id: 4, label: 'Export', icon: Download, variant: 'secondary' }
];

function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button 
            key={action.id} 
            className={`quick-action-btn quick-action-btn--${action.variant}`}
          >
            <Icon size={18} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActions;
