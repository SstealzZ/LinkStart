import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useUser();

  return isAuthenticated ? <Navigate to="/" replace /> : element;
};

export default PublicRoute;
