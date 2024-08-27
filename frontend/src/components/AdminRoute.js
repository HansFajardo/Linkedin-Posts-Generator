import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));

  return token && isAdmin ? element : <Navigate to="/login" replace />;
};

export default AdminRoute;
