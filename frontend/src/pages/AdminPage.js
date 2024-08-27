import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <button
      className='logout-btn'
        onClick={handleLogout}
      >
        Logout
      </button>
      <p>Welcome, Admin! You have special privileges.</p>
    </div>
  );
}

export default AdminPage;
