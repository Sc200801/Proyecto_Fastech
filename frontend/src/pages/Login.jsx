import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import API_BASE_URL from '../config';

function Login() {
  const [esLogin, setEsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false); // <-- ESTADO PARA EL OJITO
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    // 🎯 1. CONSTRUCCIÓN DINÁMICA DE LA URL USANDO LA CONFIGURACIÓN GLOBAL
    // Reemplazamos los "http://localhost:5000" para que use tu IP y funcione en celular
    const url = esLogin 
      ? `${API_BASE_URL}/api/login` 
      : `${API_BASE_URL}/api/registro`;

    const cuerpoInput = esLogin 
      ? { email, password } 
      : { nombre, email, password };

    try {
      // 🚀 2. UN SOLO FETCH CONTROLADO CON ASYNC/AWAIT
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpoInput)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      if (esLogin) {
        // GUARDAMOS EN LOCALSTORAGE
        localStorage.setItem('userRole', data.usuario.role || data.usuario.rol);
        localStorage.setItem('userName', data.usuario.nombre);
        localStorage.setItem('isLoggedIn', 'true'); // <-- NUEVO: Bandera de sesión activa

        if ((data.usuario.role || data.usuario.rol) === 'admin') {
          navigate('/admin-panel');
        } else {
          navigate('/productos');
        }
        
        // Forzamos un refresco rápido para que App.js capte el login al instante
        window.location.reload();
      } else {
        setMensajeExito('¡Usuario registrado con éxito! Ya puedes iniciar sesión.');
        setEsLogin(true);
        setNombre('');
        setPassword('');
        setVerPassword(false); // Reseteamos el ojito
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>{esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        
        {error && <p className="login-error">{error}</p>}
        {mensajeExito && <p className="login-success">{mensajeExito}</p>}

        {!esLogin && (
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            required 
          />
        )}

        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        
        {/* CONTENEDOR DEL INPUT DE CONTRASEÑA CON EL OJITO */}
        <div className="password-wrapper" style={{ position: 'relative', width: '100%' }}>
          <input 
            type={verPassword ? "text" : "password"}
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', paddingRight: '40px' }} // Espacio para que el texto no tape al ojito
          />
          <span 
            onClick={() => setVerPassword(!verPassword)} 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              userSelect: 'none'
            }}
          >
            {verPassword ? '🙈' : '👁️'}
          </span>
        </div>
        
        <button type="submit" className="login-btn">
          {esLogin ? 'Ingresar' : 'Registrarse'}
        </button>

        <p className="toggle-auth" onClick={() => { setEsLogin(!esLogin); setError(''); setMensajeExito(''); setVerPassword(false); }}>
          {esLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </form>
    </div>
  );
}

export default Login; 
