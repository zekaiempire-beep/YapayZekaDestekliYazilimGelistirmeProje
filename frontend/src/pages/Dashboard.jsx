import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StudentDashboard } from '../components/StudentDashboard';
import { StaffDashboard } from '../components/StaffDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Bilinmeyen rol</div>;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Sınav Yönetim Sistemi</h1>
          <div className="user-info">
            <span>
              Merhaba, {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>
      <main className="dashboard-content">{renderDashboard()}</main>
    </div>
  );
};
