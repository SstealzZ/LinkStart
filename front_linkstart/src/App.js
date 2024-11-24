import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Assure-toi d'importer ton thème
import { UserProvider, useUser } from './context/UserContext'; // Import du contexte utilisateur
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ServiceProvider } from './context/ServiceContext'; // Importez le ServiceProvider

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <ServiceProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ProtectedRoute element={<Home />} />} />
              <Route path="/login" element={<PublicRoute element={<Login />} />} />
              <Route path="/register" element={<PublicRoute element={<Register />} />} />
            </Routes>
          </Router>
        </ServiceProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
