import React, { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // Inicializamos el carrito leyendo el localStorage del navegador
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito_fastech');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Cada vez que el carrito cambie, lo respaldamos en la memoria local
  useEffect(() => {
    localStorage.setItem('carrito_fastech', JSON.stringify(carrito));
  }, [carrito]);

  // Agregar un producto al carrito
 const agregarAlCarrito = (producto) => {
  setCarrito((prev) => {
    const existe = prev.find((item) => item.id === producto.id);
    if (existe) {
      // Validamos que NO supere el stock físico Y TAMPOCO supere el límite de 3 ítems
      if (existe.cantidad < producto.stock && existe.cantidad < 3) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      alert("¡Límite alcanzado! Solo se permiten un máximo de 3 unidades por producto.");
      return prev;
    }
    return [...prev, { ...producto, cantidad: 1 }];
  });
};

  // Cambiar cantidad directamente (por ejemplo en el selector dinámico)
  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
    );
  };

  // Eliminar un artículo del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  // Vaciar por completo tras una compra exitosa
  const vaciarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}