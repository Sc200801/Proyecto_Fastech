import React, { useState, useContext } from 'react'; // 🎯 Importamos useContext
import { Link } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext'; // 🎯 Importamos tu contexto
import './Navbar.css';

import logoFastech from '../assets/logo.png'; 

export default function Navbar({ autenticado, onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // 🎯 Conectamos el Navbar al motor global del carrito
  const { carrito } = useContext(CarritoContext);

  // 🎯 Sumamos la cantidad real de artículos para el contador del Navbar
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <>
      <nav className="navbar-container">
        
        <Link to="/" className="navbar-logo-link" onClick={() => setMenuAbierto(false)}>
          <img src={logoFastech} alt="Logo Fastech" className="navbar-logo-img" /> 
          <div>
            <h1 className="navbar-title">Fastech</h1>
          </div>
        </Link>

        {/* 💻 MENÚ DE ESCRITORIO */}
        <div className="navbar-menu-desktop">
          <Link to="/productos" className="nav-link">🛍️ Productos</Link>
          
          {/* 🎯 Mostramos el total real de artículos aquí */}
          <Link to="/carrito" className="nav-btn-carrito">
            🛒 Mi Carrito ({totalArticulos})
          </Link>

          {autenticado ? (
            <button onClick={onLogout} className="nav-link-logout">🚪 Cerrar Sesión</button>
          ) : (
            <Link to="/login" className="nav-link">🔑 Inicio / Registro</Link>
          )}
        </div>

        {/* --- 🍔 BOTÓN HAMBURGUESA --- */}
        <button 
          className={`navbar-toggle-btn ${menuAbierto ? 'open' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Abrir menú"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* --- 🌓 1. CAPA OSCURA DE FONDO (Overlay colocado ANTES del menú) --- */}
        {menuAbierto && (
          <div className="navbar-drawer-overlay" onClick={() => setMenuAbierto(false)} />
        )}

        {/* --- 📱 2. MENÚ LATERAL MÓVIL (Side Drawer) --- */}
        <div className={`navbar-menu-mobile-drawer ${menuAbierto ? 'active' : ''}`}>
          
          {/* Cabecera interna */}
          <div className="drawer-mobile-header">
            {autenticado ? (
              <span className="drawer-user-greet">👤 Conectado</span>
            ) : (
              <Link to="/login" className="drawer-login-btn" onClick={() => setMenuAbierto(false)}>
                👤 Iniciar Sesión
              </Link>
            )}
            <button className="drawer-close-x" onClick={() => setMenuAbierto(false)}>×</button>
          </div>

          {/* Enlaces verticales del menú */}
          <div className="drawer-links-wrapper">
            <Link to="/productos" className="drawer-nav-item" onClick={() => setMenuAbierto(false)}>
              🛍️ Productos
            </Link>
            
            <Link to="/carrito" className="drawer-nav-item" onClick={() => setMenuAbierto(false)}>
              🛒 Mi Carrito <span className="cart-badge">{totalArticulos || 0}</span>
            </Link>

            {autenticado ? (
              <button 
                onClick={() => { onLogout(); setMenuAbierto(false); }} 
                className="drawer-nav-item logout-mobile-btn"
              >
                🚪 Cerrar Sesión
              </button>
            ) : (
              <Link to="/login" className="drawer-nav-item" onClick={() => setMenuAbierto(false)}>
                🔑 Inicio / Registro
              </Link>
            )}
          </div>
          
        </div>

      </nav>
    </>
  );
}