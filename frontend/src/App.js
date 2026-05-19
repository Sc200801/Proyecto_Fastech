import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext'; // 🎯 Mantenemos el motor central del carrito
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Productos from './pages/Productos';
import Carrito from './pages/Carrito'; 
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; 
import DetalleProducto from './pages/DetalleProducto';
import './index.css';

// Componente Guardián de Seguridad para la ruta Admin
const ProtectedAdminRoute = ({ children }) => {
  const role = localStorage.getItem('userRole');
  const loggedIn = localStorage.getItem('isLoggedIn');

  if (!loggedIn || role !== 'admin') {
    return <Navigate to="/login" replace />; 
  }
  return children;
};

export default function App() {
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setAutenticado(true);
    }
  }, []);

  const manejarLogout = () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión en Fastech?");

    if (confirmar) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('isLoggedIn');
      setAutenticado(false);
      window.location.href = '/login'; 
    }
  };

  return (
    <CarritoProvider>
      <Router>
        
        {/* 🎯 Al ponerlo aquí afuera de <Routes>, aparecerá mágicamente en todas las páginas y mantendrá su responsividad móvil */}
        <Navbar autenticado={autenticado} onLogout={manejarLogout} />
        
        {/* Envoltura responsiva para el contenido de tus páginas */}
        <div className="app-container">
          <Routes>
            {/* Nota: Mantenemos tu página de Inicio en la raíz "/" como en tu versión original */}
            <Route path="/" element={<Inicio />} />
            
            <Route 
              path="/login" 
              element={
                localStorage.getItem('isLoggedIn') === 'true' ? (
                  localStorage.getItem('userRole') === 'admin' ? <Navigate to="/admin-panel" /> : <Navigate to="/productos" />
                ) : (
                  <Login />
                )
              } 
            />
            
            <Route path="/productos" element={<Productos />} /> 
            
            {/* Unificamos el formato a /productos/:id para mantener el estándar de tu catálogo */}
            <Route path="/productos/:id" element={<DetalleProducto />} />
            
            <Route path="/carrito" element={<Carrito />} />
            
            <Route 
              path="/admin-panel" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </div>

      </Router>
    </CarritoProvider>
  );
}