import React, { useState, useEffect } from 'react';
import camaraImg from '../assets/productos/fotografia/camara-canon.png';
import laptopImg from '../assets/productos/computacion/laptop-lenovo.png';
import roboImg from '../assets/productos/robotica/kit-robotica.png';

export default function Inicio() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Datos para el carrusel de imágenes
  const destacados = [
    {
      id: 1,
      titulo: "Cámaras Profesionales y Lentes",
      categoria: "Fotografía",
      descripcion: "Captura cada detalle con la máxima fidelidad y tecnología de vanguardia.",
      imagen: camaraImg
    },
    {
      id: 2,
      titulo: "Poder y Rendimiento Sin Límites",
      categoria: "Computación",
      descripcion: "Equipos diseñados para desarrollo, diseño y flujos de trabajo exigentes.",
      imagen: laptopImg
    },
    {
      id: 3,
      titulo: "Automatización y Robótica",
      categoria: "Robótica",
      descripcion: "Explora kits de desarrollo y componentes para tus proyectos tecnológicos.",
      imagen: roboImg
    }
  ];

  // Efecto para que el carrusel pase automáticamente cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destacados.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [destacados.length]);

  return (
    <div style={{ backgroundColor: '#30343F', color: '#FFD9DA', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* 1. SECCIÓN DEL CARRUSEL DINÁMICO */}
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden', backgroundColor: '#30343F' }}>
        {destacados.map((slide, index) => (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              backgroundImage: `linear-gradient(to right, rgba(27, 32, 33, 0.9) 40%, rgba(27, 32, 33, 0.2)), url(${slide.imagen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Contenido del Slide */}
            <div style={{ padding: '0 80px', maxWidth: '600px' }}>
              <span style={{ 
                backgroundColor: '#89023E', 
                color: '#f0eff4', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {slide.categoria}
              </span>
              <h2 style={{ fontSize: '2.5rem', color: '#FFD9DA', margin: '15px 0 10px 0', lineHeight: '1.2' }}>
                {slide.titulo}
              </h2>
              <p style={{ color: '#f0eff4', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.5' }}>
                {slide.descripcion}
              </p>
            </div>
          </div>
        ))}

        {/* Indicadores de bolitas (Dots) del carrusel */}
        <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {destacados.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentSlide ? '#EA638C' : 'rgba(255, 249, 250, 0.3)',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. SECCIÓN DEL ESLOGAN (Abajo del Carrusel, estilizada y limpia) */}
      <div style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '800px', margin: 'auto' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: '#FFD9DA', 
          letterSpacing: '-1px',
          margin: '0 0 20px 0'
        }}>
          Conecta. Compra. Descubre
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#f0eff4', 
          lineheight: '1.6',
          maxWidth: '600px',
          margin: 'auto'
        }}>
          Explora los mejores productos tecnológicos disponibles en Fastech. 
          Un entorno rápido, seguro y diseñado especialmente para ti.
        </p>

        {/* Línea decorativa elegante con tu paleta */}
        <div style={{ 
          height: '4px', 
          width: '100px', 
          background: 'linear-gradient(to right, #89023E, #EA638C)', 
          margin: '40px auto 0 auto',
          borderRadius: '2px'
        }} />
      </div>

    </div>
  );
}