import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// 1. Importamos el proveedor del carrito desde la carpeta donde lo creaste
import { CarritoProvider } from './context/CarritoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Envolvemos App con el proveedor poder usar la función de  mi carrito en todo el sitio */}
    <CarritoProvider>
      <App />
    </CarritoProvider>
  </React.StrictMode>
);

reportWebVitals();