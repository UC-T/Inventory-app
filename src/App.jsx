import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SideBar from './components/SideBar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AssetsPage from './components/AssetsPage';
import ConsumablesPage from './components/ConsumablesPage';
import LocationsPage from './components/LocationsPage';
import CategoriesPage from './components/CategoriesPage';
import ActivityPage from './components/ActivityPage';
import SettingsPage from './components/SettingsPage';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <SideBar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="main-wrapper">
        <Header onMenuClick={toggleSidebar} collapsed={sidebarCollapsed} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/consumables" element={<ConsumablesPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
