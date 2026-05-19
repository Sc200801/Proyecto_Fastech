import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext'; // 1. Importamos el contexto del carrito
import './DetalleProducto.css';
// 🎯 2. Importamos la dirección IP centralizada desde tu archivo de configuración
import API_BASE_URL from '../config'; 

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extraemos las funciones globales del motor del carrito
  const { carrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useContext(CarritoContext);

  const [producto, setProducto] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false); // Controla la visibilidad del Drawer lateral

  // 🚀 3. OBTENER DETALLES (Ruta dinámica basada en tu IP local)
  useEffect(() => {
    fetch(`${API_BASE_URL}/productos`)
      .then((res) => res.json())
      .then((data) => {
        const encontrado = data.find((p) => p.id === parseInt(id));
        setProducto(encontrado);
      })
      .catch((err) => console.error("Error cargando detalles del producto:", err));
  }, [id]);

  // Calcula el costo total multiplicando el precio de cada artículo por su cantidad elegida
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // 🎯 NUEVO: Calcula el total real de piezas físicas (Ej: 3 licuadoras + 1 lavadora = 4)
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // 🚀 4. PROCESAR COMPRA DIRECTA (Ruta dinámica para el checkout)
  const procesarCompraFinal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productosComprados: carrito })
      });

      if (response.ok) {
        alert('🎉 ¡Compra procesada con éxito!');
        vaciarCarrito();
        setIsCartOpen(false);
        window.location.reload();
      } else {
        alert('Error al sincronizar el inventario en el servidor.');
      }
    } catch (error) {
      console.error("Error en el proceso de compra:", error);
    }
  };

  const obtenerImagenUrl = (nombreImagen, categoriaProducto) => {
    if (!categoriaProducto || !nombreImagen) {
      return require('../assets/productos/default.png');
    }
    const carpetaFormateada = categoriaProducto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    try {
      return require(`../assets/productos/${carpetaFormateada}/${nombreImagen}`);
    } catch (e) {
      return require('../assets/productos/default.png');
    }
  };

  if (!producto) {
    return <div className="loading-detail">Cargando especificaciones del producto Fastech...</div>;
  }

  const volverAlCatalogo = () => {
    const categoriaOrigen = location.state?.categoriaOrigen || 'Todos';
    navigate('/productos', { state: { categoriaRegreso: categoriaOrigen } });
  };

  return (
    <div className="detalle-page-container" style={{ backgroundColor: '#1B2021', minHeight: '100vh', position: 'relative' }}>
      
      <button className="btn-volver" onClick={volverAlCatalogo}>
        ⬅ Volver al catálogo
      </button>

      <div className="detalle-card-layout">
        <div className="detalle-media-block">
          <div className="detalle-main-img-container">
            <img 
              src={obtenerImagenUrl(producto.imagen, producto.categoria)} 
              alt={producto.nombre} 
              className="detalle-main-img"
            />
          </div>
        </div>

        <div className="detalle-info-block">
          <span className="detalle-sku">Código de producto: FST-00{producto.id}</span>
          <h1 className="detalle-title" style={{ color: '#FFD9DA' }}>{producto.nombre}</h1>
          <span className="detalle-categoria-tag" style={{ backgroundColor: '#89023E', color: '#FFD9DA' }}>{producto.categoria}</span>
          
          <div className="detalle-precio-box" style={{ backgroundColor: '#30343F' }}>
            <p className="detalle-price-label">Precio:</p>
            <h2 className="detalle-price-value" style={{ color: '#f0eff4' }}>${parseFloat(producto.precio).toFixed(2)}</h2>
            <p style={{ fontSize: '0.85rem', color: producto.stock > 0 ? '#2ecc71' : '#ff4d4d', marginTop: '5px' }}>
              Disponibles en almacén: {producto.stock} unidades
            </p>
          </div>

          {/* BOTÓN AGREGAR AL CARRITO */}
          <button 
            className="btn-agregar-carrito" 
            disabled={producto.stock <= 0}
            onClick={() => {
              agregarAlCarrito(producto);
              setIsCartOpen(true);
            }}
            style={{
              backgroundColor: producto.stock > 0 ? '#EA638C' : '#555',
              color: '#f0eff4',
              fontWeight: 'bold',
              padding: '15px',
              border: 'none',
              borderRadius: '4px',
              cursor: producto.stock > 0 ? 'pointer' : 'not-allowed',
              width: '100%',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#b30050'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#EA638C'; }}
          >
            {producto.stock > 0 ? '🛒 Agregar al Carrito' : '⚠️ Sin Stock Temporal'}
          </button>

          <div className="detalle-specs">
            <h3>Especificaciones técnicas</h3>
            <p style={{ whiteSpace: 'pre-line', color: '#f0eff4', lineHeight: '1.6' }}>
              {producto.specifications || producto.especificaciones || 'No hay especificaciones disponibles para este artículo.'}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== INTERFAZ DEL CARRITO LATERAL (DRAWER) ==================== */}
      {isCartOpen && (
        <>
          {/* Fondo oscuro con el EFECTO BLUR */}
          <div 
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(27, 32, 33, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 999
            }}
          />

          {/* Panel Lateral Flotante */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: '#30343F',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            color: '#FFD9DA',
            fontFamily: 'sans-serif'
          }}>
            {/* Cabecera del panel */}
            <div style={{ padding: '20px', borderBottom: '1px solid #89023E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Carrito ({totalArticulos})</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#EA638C', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Lista de productos agregados */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {carrito.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#ccc', marginTop: '40px' }}>Tu carrito está vacío.</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', backgroundColor: '#1B2021', padding: '10px', borderRadius: '6px', position: 'relative' }}>
                    <img 
                      src={obtenerImagenUrl(item.imagen, item.categoria)} 
                      alt={item.nombre} 
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#FFD9DA' }}>{item.nombre}</h4>
                      <p style={{ margin: '0 0 8px 0', color: '#f0eff4', fontWeight: 'bold' }}>${parseFloat(item.precio).toFixed(2)}</p>
                      
                      {/* Selector de cantidad limitado a un máximo de 3 piezas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Cant:</span>
                        <select 
                          value={item.cantidad} 
                          onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                          style={{ backgroundColor: '#30343F', color: 'white', border: '1px solid #89023E', borderRadius: '3px', padding: '2px' }}
                        >
                          {[...Array(Math.min(3, item.stock)).keys()].map(x => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Botón de eliminar bote de basura */}
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bloque de Totales y Caja de Botones */}
            <div style={{ padding: '20px', borderTop: '1px solid #89023E', backgroundColor: '#1B2021' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total:</span>
                <span style={{ color: '#f0eff4' }}>${total.toFixed(2)}</span>
              </div>

              {/* BOTÓN PRINCIPAL: Compra Directa */}
              <button 
                onClick={procesarCompraFinal}
                disabled={carrito.length === 0}
                style={{
                  width: '100%',
                  backgroundColor: '#EA638C',
                  color: '#f0eff4',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: carrito.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: carrito.length > 0 ? 1 : 0.5,
                  marginBottom: '10px'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#cd3462'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#EA638C'; }}
              >
                Comprar
              </button>

              {/* BOTÓN SECUNDARIO: Enlace a la pantalla completa del Carrito */}
              <button 
                onClick={() => {
                  setIsCartOpen(false); // Cierra el panel lateral
                  navigate('/carrito'); // Navega a la página completa
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#f0eff4',
                  border: '1px solid #89023E',
                  padding: '12px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(137, 2, 62, 0.2)'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
              >
                Ver detalles del carrito 
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}