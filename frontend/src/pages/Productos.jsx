import React, { useState, useEffect } from 'react';
// 1. Importamos useLocation junto a useNavigate
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import './Productos.css';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  
  // Hooks de React Router
  const navigate = useNavigate();
  const location = useLocation(); // 2. Inicializamos el hook para escuchar la memoria de navegación

  useEffect(() => {
    // para que muestre los producto desde el teléfono
    fetch(`${API_BASE_URL}/productos`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // 3. Modificamos el estado inicial: si venimos de 'Detalle' con una categoría guardada, la usamos; si no, por defecto 'Todos'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    location.state?.categoriaRegreso || 'Todos'
  );

  // 4. NUEVO EFFECT: Si el estado 'location.state' cambia (porque el usuario regresó), forzamos al filtro a actualizarse
  useEffect(() => {
    if (location.state?.categoriaRegreso) {
      setCategoriaSeleccionada(location.state.categoriaRegreso);
    }
  }, [location.state]);

  const categorias = ['Todos', 'Fotografía', 'Robótica', 'Teléfonos y Tablets', 'Computación', 'Hogar'];

  const productosFiltrados = categoriaSeleccionada === 'Todos'
    ? productos
    : productos.filter((p) => p.categoria === categoriaSeleccionada);

  // Mapeador dinámico a las 5 subcarpetas físicas
  const obtenerImagenUrl = (nombreImagen, categoriaProducto) => {
    if (!categoriaProducto || !nombreImagen) {
      return require('../assets/productos/default.png');
    }

    const carpetaFormateada = categoriaProducto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    try {
      return require(`../assets/productos/${carpetaFormateada}/${nombreImagen}`);
    } catch (e) {
      return require('../assets/productos/default.png');
    }
  };

  // 5. NUEVA FUNCIÓN DE NAVEGACIÓN: Enviamos al usuario al detalle PERO guardamos la categoría actual en la maleta (state)
  const irAlDetalle = (prod) => {
    navigate(`/productos/${prod.id}`, {
      state: { categoriaOrigen: categoriaSeleccionada } // Guardamos la categoría actual
    });
  };

  return (
    <div className="productos-page-container">
      
      {/* BARRA LATERAL DE FILTROS */}
      <aside className="sidebar-filtros">
        <h3>FILTRAR POR</h3>
        <div className="filtro-seccion">
          <h4>Categorías</h4>
          <ul>
            {categorias.map((cat, idx) => (
              <li 
                key={idx} 
                className={categoriaSeleccionada === cat ? 'active-filter' : ''}
                onClick={() => setCategoriaSeleccionada(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* REJILLA DE PRODUCTOS TECH */}
      <main className="productos-main-content">
        <div className="productos-grid">
          {productosFiltrados.map((prod) => (
            <div 
              key={prod.id} 
              className="producto-card"
              onClick={() => irAlDetalle(prod)} // 6. CAMBIO AQUÍ: Usamos nuestra nueva función con memoria
              style={{ cursor: 'pointer' }}
            >
              <div className="producto-img-wrapper">
                <img 
                  src={obtenerImagenUrl(prod.imagen, prod.categoria)} 
                  alt={prod.nombre} 
                  className="producto-card-img"
                  onError={(e) => { 
                    e.target.src = new URL(`../assets/productos/default.png`, import.meta.url).href; 
                  }}
                />
              </div>
              <div className="producto-card-info">
                <span className="producto-card-fst">FST-00{prod.id}</span>
                <h3 className="producto-card-title">{prod.nombre}</h3>
                <p className="producto-card-price">${parseFloat(prod.precio).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}