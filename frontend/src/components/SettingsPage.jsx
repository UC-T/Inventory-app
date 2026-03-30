import React from 'react';
import { User, Building, Bell, Shield, Database, Palette, ChevronRight } from 'lucide-react';
import '../styling/SettingsPage.css';

const settingsSections = [
  { id: 1, name: 'Profile Settings', description: 'Manage your account details and preferences', icon: User },
  { id: 2, name: 'Organization', description: 'Company information and branding', icon: Building },
  { id: 3, name: 'Notifications', description: 'Configure alert thresholds and email preferences', icon: Bell },
  { id: 4, name: 'Security', description: 'Password, 2FA, and session management', icon: Shield },
  { id: 5, name: 'Data Management', description: 'Import, export, and backup options', icon: Database },
  { id: 6, name: 'Appearance', description: 'Theme and display preferences', icon: Palette },
];

function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <button key={section.id} className="settings-card">
              <div className="settings-card-icon">
                <Icon size={22} />
              </div>
              <div className="settings-card-content">
                <h3 className="settings-card-title">{section.name}</h3>
                <p className="settings-card-description">{section.description}</p>
              </div>
              <ChevronRight size={20} className="settings-card-arrow" />
            </button>
          );
        })}
      </div>

      <div className="settings-info">
        <h4>System Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Environment</span>
            <span className="info-value">Production</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Sync</span>
            <span className="info-value">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
