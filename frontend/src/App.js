import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import SideBar        from './components/SideBar';
import Header         from './components/Header';
import Dashboard      from './components/Dashboard';
import AssetsPage     from './components/AssetsPage';
import ConsumablesPage from './components/ConsumablesPage';
import LocationsPage  from './components/LocationsPage';
import CategoriesPage from './components/CategoriesPage';
import ActivityPage   from './components/ActivityPage';
import SettingsPage   from './components/SettingsPage';
import Login          from './components/Login.jsx';
import './App.css';

// ─── Route guard — redirects to /login if not authenticated ───────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Role guard — shows 403 if role lacks permission ──────────────
function RoleRoute({ children, permission }) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <div className="forbidden">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }
  return children;
}

// ─── Main authenticated layout ────────────────────────────────────
function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const { can } = useAuth();

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <SideBar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
      <div className="main-wrapper">
        <Header onMenuClick={() => setSidebarCollapsed(p => !p)} collapsed={sidebarCollapsed} />
        <main className="main-content">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/assets"      element={<AssetsPage />} />
            <Route path="/consumables" element={<ConsumablesPage />} />
            <Route path="/locations"   element={
              <RoleRoute permission="location_manage"><LocationsPage /></RoleRoute>
            } />
            <Route path="/categories"  element={
              <RoleRoute permission="category_manage"><CategoriesPage /></RoleRoute>
            } />
            <Route path="/activity"    element={
              <RoleRoute permission="log_view"><ActivityPage /></RoleRoute>
            } />
            <Route path="/settings"    element={
              <RoleRoute permission="settings_view"><SettingsPage /></RoleRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────
function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <PrivateRoute><AppLayout /></PrivateRoute>
      } />
    </Routes>
  );
}

export default App;