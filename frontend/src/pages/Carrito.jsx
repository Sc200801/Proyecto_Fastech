import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { useNavigate } from 'react-router-dom';
// 🎯 1. Importamos la dirección IP centralizada desde tu archivo de configuración
import API_BASE_URL from '../config'; 

export default function Carrito() {
  const navigate = useNavigate();
  
  // Conectamos la página al motor de la cocina (Contexto)
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useContext(CarritoContext);

  // Calculamos el total neto de toda la orden de compra
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Lógica para enviar la orden final al servidor Node.js/Flask
  const finalizarCompra = async () => {
    try {
      // 🚀 2. Reemplazamos "http://localhost:5000" por tu variable global dinámica
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productosComprados: carrito })
      });

      if (response.ok) {
        alert('🎉 ¡Compra procesada con éxito! Tu inventario en MySQL ha sido actualizado.');
        vaciarCarrito();
        navigate('/productos'); // Redirecciona al catálogo limpio
      } else {
        alert('Error al procesar la transacción en el servidor.');
      }
    } catch (error) {
      console.error("Error en el checkout:", error);
    }
  };

  // Función auxiliar para renderizar las imágenes
  const obtenerImagenUrl = (nombreImagen, categoriaProducto) => {
    if (!categoriaProducto || !nombreImagen) return require('../assets/productos/default.png');
    const carpetaFormateada = categoriaProducto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    try {
      return require(`../assets/productos/${carpetaFormateada}/${nombreImagen}`);
    } catch (e) {
      return require('../assets/productos/default.png');
    }
  };

  return (
    <div style={{ backgroundColor: '#30343F', minHeight: '90vh', padding: '40px', color: '#FFD9DA', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #89023E', paddingBottom: '15px', color: '#EA638C' }}>
        Resumen de tu Carrito de Compras
      </h1>

      {carrito.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ fontSize: '1.2rem', color: '#f0eff4' }}>Aún no has añadido ningún artículo de Fastech a tu orden.</p>
          <button 
            onClick={() => navigate('/productos')}
            style={{ backgroundColor: '#EA638C', color: '#f0eff4', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}
          
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#b30050'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#EA638C'; }}
          >
            Explorar productos
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', marginTop: '30px', flexWrap: 'wrap' }}>
          
          {/* LADO IZQUIERDO: LISTA DE PRODUCTOS */}
          <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {carrito.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '20px', backgroundColor: '#1B2021', padding: '15px', borderRadius: '8px', alignItems: 'center', position: 'relative' }}>
                <img 
                  src={obtenerImagenUrl(item.imagen, item.categoria)} 
                  alt={item.nombre} 
                  style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#FFD9DA' }}>{item.nombre}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#f0eff4', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ${parseFloat(item.precio).toFixed(2)}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Cantidad:</span>
                    <select 
                      value={item.cantidad} 
                      onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                      style={{ backgroundColor: '#1B2021', color: 'white', border: '1px solid #89023E', borderRadius: '4px', padding: '5px' }}
                    >
                      {[...Array(Math.min(3, item.stock)).keys()].map(x => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => eliminarDelCarrito(item.id)}
                  style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '1.3rem', cursor: 'pointer', padding: '10px' }}
                  title="Eliminar artículo"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* LADO DERECHO: CAJA DE PAGO RESUMIDA */}
          <div style={{ flex: 1, minWidth: '250px', backgroundColor: '#1B2021', padding: '25px', borderRadius: '8px', height: 'fit-content', border: '1px solid #89023E' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', borderBottom: '1px solid #89023E', paddingBottom: '10px' }}>
              Total del Pedido
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '25px' }}>
              <span style={{ flex: 1 }}>Total Neto:</span>
              <span style={{ color: '#f0eff4' }}>${total.toFixed(2)}</span>
            </div>

            <button 
              onClick={finalizarCompra}
              style={{
                width: '100%',
                backgroundColor: '#EA638C',
                color: '#f0eff4',
                border: 'none',
                padding: '15px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#b30050'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#EA638C'; }}
            >
              Confirmar Compra
            </button>
          </div>

        </div>
      )}
    </div>
  );
}