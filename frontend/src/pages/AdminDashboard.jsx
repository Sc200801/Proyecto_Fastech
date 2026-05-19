import React, { useState, useEffect } from 'react';
// 🎯 1. Importamos la dirección IP centralizada desde tu archivo de configuración
import API_BASE_URL from '../config'; 

export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('Fotografía');
  const [especificaciones, setEspecificaciones] = useState(''); 
  const [imagen, setImagen] = useState('default.png'); 

  const [editando, setEditando] = useState(false);
  const [idProductoAEditar, setIdProductoAEditar] = useState(null);

  // Controla qué productos tienen su panel de especificaciones abierto en la tabla
  const [especificacionesAbiertas, setEspecificacionesAbiertas] = useState({});

  // ESTADO NUEVO: Controla qué categoría está seleccionada en el filtro
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  // Controla qué menú de acciones rápido está abierto en móvil (guarda el ID del producto)
  const [menuAccionesAbierto, setMenuAccionesAbierto] = useState(null);

  // 📱 DETECTOR DE RESPONSIVIDAD
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const LIMITE_STOCK_BAJO = 5;

  // Lista de categorías para las pestañas (Tabs)
  const categoriasFiltro = ['Todos', 'Fotografía', 'Robótica', 'Teléfonos y Tablets', 'Computación', 'Hogar'];

  // 🚀 OBTENER PRODUCTOS
  const obtenerProductos = () => {
    fetch(`${API_BASE_URL}/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // Función para alternar el desplegable de un producto
  const toggleEspecificaciones = (id) => {
    setEspecificacionesAbiertas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Alterna el mini menú flotante de acciones en móvil
  const toggleMenuAcciones = (id) => {
    setMenuAccionesAbierto(menuAccionesAbierto === id ? null : id);
  };

  // 🚀 GUARDAR / EDITAR PRODUCTO
  const guardarProducto = async (e) => {
    e.preventDefault();
    
    const productoData = { 
      nombre, 
      precio: parseFloat(precio), 
      stock: parseInt(stock),
      categoria,
      especificaciones,
      imagen
    };

    try {
      if (editando) {
        const res = await fetch(`${API_BASE_URL}/productos/${idProductoAEditar}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoData)
        });

        if (res.ok) {
          alert('¡Producto actualizado con éxito!');
          setEditando(false);
          setIdProductoAEditar(null);
        } else {
          alert('Error al actualizar el producto en el servidor.');
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoData)
        });
        
        if (!res.ok) throw new Error('Error al guardar');
      }

      setNombre(''); 
      setPrecio(''); 
      setStock('');
      setEspecificaciones('');
      setImagen('default.png');
      obtenerProductos();

    } catch (error) {
      console.error("Error en la operación:", error);
    }
  };

  // Cargar datos en el formulario
  const prepararEdicion = (prod) => {
    setEditando(true);
    setIdProductoAEditar(prod.id);
    
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    setStock(prod.stock);
    setCategoria(prod.categoria || 'Fotografía');
    setEspecificaciones(prod.especificaciones || '');
    setImagen(prod.imagen || 'default.png');
    
    setMenuAccionesAbierto(null); // Cierra el menú al editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditando(false);
    setIdProductoAEditar(null);
    setNombre(''); 
    setPrecio(''); 
    setStock('');
    setEspecificaciones('');
    setImagen('default.png');
  };

  // 🚀 REABASTECER INVENTARIO
  const actualizarStock = async (id, nombreActual, stockActual) => {
    setMenuAccionesAbierto(null); // Cierra el menú móvil
    const unidadesNuevasInput = window.prompt(
      `Reabastecer inventario para: "${nombreActual}"\nStock actual: ${stockActual} unidades.\n\n¿Cuántas unidades deseas AÑADIR a la tienda?:`
    );
    
    if (unidadesNuevasInput === null || unidadesNuevasInput.trim() === '') return;
    const cantidadASumar = parseInt(unidadesNuevasInput);
    if (isNaN(cantidadASumar) || cantidadASumar <= 0) {
      alert('Por favor, ingresa un número válido.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidadASumar }) 
      });

      if (res.ok) {
        setProductos(productos.map(p => p.id === id ? { ...p, stock: p.stock + cantidadASumar } : p));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 🚀 ELIMINAR PERMANENTEMENTE
  const eliminarProducto = async (id) => {
    setMenuAccionesAbierto(null); // Cierra el menú móvil
    const confirmar = window.confirm('¿Estás segura de que deseas eliminar este producto permanentemente?');
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) setProductos(productos.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const productosFiltrados = productos.filter(p => {
    if (categoriaActiva === 'Todos') return true;
    return p.categoria === categoriaActiva;
  });

  return (
    <div style={{ padding: isMobile ? '15px' : '40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'var(--petal-frost)', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: isMobile ? '1.6rem' : '2rem' }}>
        {editando ? '✏️ Editando Producto' : 'Panel de Administración (MySQL)'}
      </h1>
          
      {/* FORMULARIO */}
      <form onSubmit={guardarProducto} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        marginBottom: '40px',
        background: '#1B2021',
        padding: isMobile ? '15px' : '25px',
        borderRadius: '8px',
        border: '1px solid rgba(137, 2, 62, 0.25)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
          <input 
            placeholder="Nombre del Producto" 
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
            required
            style={{ flex: isMobile ? 'none' : '2', padding: '12px', background: 'var(--jet-black)', color: 'white', border: '1px solid var(--dark-raspberry)', borderRadius: '4px' }}
          />
          
          <input 
            placeholder="Precio" 
            type="number" 
            step="0.01"
            value={precio} 
            onChange={e => setPrecio(e.target.value)} 
            required
            style={{ flex: isMobile ? 'none' : '1', padding: '12px', background: 'var(--jet-black)', color: 'white', border: '1px solid var(--dark-raspberry)', borderRadius: '4px' }}
          />
          
          <input 
            placeholder="Stock" 
            type="number" 
            value={stock} 
            onChange={e => setStock(e.target.value)} 
            required
            style={{ flex: isMobile ? 'none' : '1', padding: '12px', background: 'var(--jet-black)', color: 'white', border: '1px solid var(--dark-raspberry)', borderRadius: '4px' }}
          />

          <select 
            value={categoria} 
            onChange={e => setCategoria(e.target.value)}
            style={{ flex: isMobile ? 'none' : '1.5', padding: '12px', background: 'var(--jet-black)', color: 'white', border: '1px solid var(--dark-raspberry)', borderRadius: '4px', cursor: 'pointer' }}
          >
            <option value="Fotografía">Fotografía</option>
            <option value="Robótica">Robótica</option>
            <option value="Teléfonos y Tablets">Teléfonos y Tablets</option>
            <option value="Computación">Computación</option>
            <option value="Hogar">Hogar</option>
          </select>
        </div>

        <textarea 
          placeholder="Especificaciones técnicas (Escribe cada una en un renglón nuevo)" 
          value={especificaciones}
          onChange={e => setEspecificaciones(e.target.value)}
          rows="4"
          style={{ padding: '12px', background: 'var(--jet-black)', color: 'white', border: '1px solid var(--dark-raspberry)', borderRadius: '4px', resize: 'vertical', fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', justifyContent: 'flex-end' }}>
          {editando && (
            <button type="button" onClick={cancelarEdicion} style={{ background: '#555', color: 'white', border: 'none', padding: '12px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', width: isMobile ? '100%' : 'auto' }}>
              Cancelar
            </button>
          )}
          <button type="submit" style={{ background: 'var(--blush-rose)', color: 'white', border: 'none', padding: '12px 30px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', width: isMobile ? '100%' : 'auto' }}>
            {editando ? 'Guardar Cambios' : 'Guardar Producto'}
          </button>
        </div>
      </form>

      {/* ==================== INTERFAZ DE PESTAÑAS (TABS) ==================== */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
        {categoriasFiltro.map((cat) => {
          const isActive = categoriaActiva === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaActiva(cat)}
              style={{
                backgroundColor: isActive ? 'var(--blush-rose)' : '#30343F',
                color: isActive ? '#f0eff4' : 'var(--petal-frost)',
                border: isActive ? 'none' : '1px solid rgba(218, 114, 139, 0.2)',
                padding: isMobile ? '8px 14px' : '10px 20px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 10px rgba(234, 99, 140, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => { if(!isActive) e.target.style.backgroundColor = '#404654'; }}
              onMouseLeave={(e) => { if(!isActive) e.target.style.backgroundColor = '#30343F'; }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* TABLA DE PRODUCTOS FILTRADA */}
      <div style={{ borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: '100%' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          color: 'var(--white-pre)', 
          backgroundColor: '#242933', 
          fontSize: isMobile ? '0.85rem' : '0.95rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#1A1D24', borderBottom: '2px solid var(--dark-raspberry)' }}>
              {/* En móvil reducimos las cabeceras a solo 3 columnas ultra-limpias */}
              {isMobile ? (
                <>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold' }}>Producto</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '70px' }}>Stock</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '50px' }}>Acción</th>
                </>
              ) : (
                <>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#f0eff4', width: '60px' }}>ID</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#f0eff4'}}>Producto</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#f0eff4'}}>Categoría</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#f0eff4'}}>Precio</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#f0eff4' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', width: '240px', color: '#f0eff4'}}>Acciones</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={isMobile ? "3" : "6"} style={{ padding: '30px', textAlign: 'center', color: '#ccc', fontStyle: 'italic' }}>
                  No hay productos registrados en esta categoría.
                </td>
              </tr>
            ) : (
              productosFiltrados.map(p => {
                const esStockBajo = p.stock <= LIMITE_STOCK_BAJO;
                const isOpen = !!especificacionesAbiertas[p.id]; 
                const menuAbierto = menuAccionesAbierto === p.id;

                // 🎯 SE ELIMINARON LAS LLAVES HUÉRFANAS PARA REMOVER EL WARNING DE ESLINT
                return (
                  <React.Fragment key={p.id}>
                    <tr 
                      style={{ 
                        borderBottom: '1px solid rgba(218, 114, 139, 0.2)', 
                        backgroundColor: esStockBajo ? 'rgba(137, 2, 62, 0.15)' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      {isMobile ? (
                        /* =======================================================
                           VISTA DE TABLA MÓVIL MINIMALISTA (SIN SOBRECARGA)
                           ======================================================= */
                        <>
                          {/* Columna 1: Nombre + Precio sutil abajo */}
                          <td style={{ padding: '12px 10px', textAlign: 'left' }}>
                            <div style={{ fontWeight: '600', color: '#f0eff4', marginBottom: '2px' }}>{p.nombre}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--blush-rose)' }}>
                              ${parseFloat(p.precio).toFixed(2)} • {p.categoria || 'General'}
                            </div>
                            <span 
                              onClick={() => toggleEspecificaciones(p.id)}
                              style={{ fontSize: '0.7rem', color: '#FFD9DA', cursor: 'pointer', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}
                            >
                              {isOpen ? 'Ocultar info' : 'Ver info'}
                            </span>
                          </td>

                          {/* Columna 2: Stock limpio */}
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: esStockBajo ? '#e74c3c' : '#white' }}>{p.stock}</span>
                            {esStockBajo && (
                              <div style={{ color: '#e74c3c', fontSize: '0.6rem', fontWeight: 'bold' }}>¡BAJO!</div>
                            )}
                          </td>

                          {/* Columna 3: Botón de menú flotante único */}
                          <td style={{ padding: '12px 10px', textAlign: 'center', position: 'relative' }}>
                            <button 
                              type="button"
                              onClick={() => toggleMenuAcciones(p.id)}
                              style={{ background: '#30343F', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              ⚙️
                            </button>

                            {/* MENÚ DESPLEGABLE TÁCTIL ABSOLUTO (Estilo app nativa) */}
                            {menuAbierto && (
                              <div style={{ 
                                position: 'absolute', right: '10px', top: '40px', backgroundColor: '#1B2021', 
                                border: '1px solid var(--dark-raspberry)', borderRadius: '6px', zIndex: 10, 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '120px', overflow: 'hidden'
                              }}>
                                <div onClick={() => actualizarStock(p.id, p.nombre, p.stock)} style={{ padding: '10px', color: '#18a955', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #2a2a2a', cursor: 'pointer', textAlign: 'left' }}>➕ Stock</div>
                                <div onClick={() => prepararEdicion(p)} style={{ padding: '10px', color: 'var(--blush-rose)', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #2a2a2a', cursor: 'pointer', textAlign: 'left' }}>✏️ Editar</div>
                                <div onClick={() => eliminarProducto(p.id)} style={{ padding: '10px', color: '#b62525', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}>❌ Eliminar</div>
                              </div>
                            )}
                          </td>
                        </>
                      ) : (
                        /* =======================================================
                           VISTA DE ESCRITORIO ORIGINAL TRADICIONAL
                           ======================================================= */
                        <>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: 'rgba(218, 114, 139, 0.7)' }}>{p.id}</td>
                          <td style={{ padding: '16px', fontWeight: '500' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button 
                                type="button"
                                onClick={() => toggleEspecificaciones(p.id)}
                                style={{ backgroundColor: '#30343F', color: 'var(--blush-rose)', cursor: 'pointer', fontSize: '0.8rem', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--dark-raspberry)', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                              >
                                {isOpen ? '▲ Ocultar' : '▼ Especificaciones'}
                              </button>
                              <span style={{ lineHeight: '1.4' }}>{p.nombre}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', color: 'var(--blush-rose)', fontSize: '0.9rem', fontWeight: '500' }}>{p.categoria || 'General'}</td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>${parseFloat(p.precio).toFixed(2)}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span>{p.stock} unidades</span>
                              {esStockBajo && <span style={{ background: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>STOCK BAJO</span>}
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => actualizarStock(p.id, p.nombre, p.stock)} style={{ backgroundColor: '#18a955', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Stock</button>
                              <button onClick={() => prepararEdicion(p)} style={{ backgroundColor: '#b01a5d', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Editar</button>
                              <button onClick={() => eliminarProducto(p.id)} style={{ backgroundColor: '#b62525', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Eliminar</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Desplegable de especificaciones bien formateado */}
                    {isOpen && (
                      <tr style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                        <td colSpan={isMobile ? "3" : "6"} style={{ padding: isMobile ? '12px' : '20px 25px', fontSize: '0.85rem', color: '#ccc' }}>
                          <div style={{ borderLeft: '3px solid var(--blush-rose)', paddingLeft: isMobile ? '10px' : '20px' }}>
                            <strong style={{ color: 'var(--petal-frost)', display: 'block', marginBottom: '6px' }}>Especificaciones Técnicas:</strong>
                            <p style={{ whiteSpace: 'pre-line', margin: 0, lineHeight: '1.5', color: '#e0e0e0' }}>
                              {p.especificaciones || 'Sin especificaciones registradas.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}