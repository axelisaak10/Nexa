'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

// Background scenes with beautiful minimalist colors
const scenes = [
  { id: 'living', name: 'Salón Escandinavo', bg: '#F2ECE4', wall: '#E2D9CE' },
  { id: 'office', name: 'Estudio de Lectura', bg: '#E3DFDA', wall: '#CECAC5' },
  { id: 'gallery', name: 'Galería de Arte', bg: '#EAEAEA', wall: '#DCDCDC' }
];

// Customizable objects
const customizableObjects = {
  sofa: {
    name: 'Sofá Modular Nexa',
    price: 1150.00,
    materials: [
      { name: 'Bouclé Verde Musgo', color: '#4E5A44', extraPrice: 0, img: '/images/products/green_sofa.png' },
      { name: 'Terciopelo Terracota', color: '#A04D3A', extraPrice: 120, img: '/images/products/green_sofa.png' },
      { name: 'Lino Blanco Roto', color: '#EAE5DB', extraPrice: 50, img: '/images/products/green_sofa.png' }
    ]
  },
  tray: {
    name: 'Bandeja Orgánica',
    price: 95.00,
    materials: [
      { name: 'Travertino Clásico', color: '#D6C8B5', extraPrice: 0, img: '/images/products/travertine_tray.png' },
      { name: 'Mármol Negro Marquina', color: '#252525', extraPrice: 35, img: '/images/products/travertine_tray.png' },
      { name: 'Piedra Caliza Mate', color: '#E3DFD5', extraPrice: 15, img: '/images/products/travertine_tray.png' }
    ]
  },
  lamp: {
    name: 'Lámpara Articulada',
    price: 195.00,
    materials: [
      { name: 'Latón Cepillado', color: '#C8A261', extraPrice: 0, img: '/images/products/desk_lamp.png' },
      { name: 'Negro Mate Texturizado', color: '#1E1E1E', extraPrice: 0, img: '/images/products/desk_lamp.png' },
      { name: 'Acero Inoxidable Pulido', color: '#B5B5B5', extraPrice: 25, img: '/images/products/desk_lamp.png' }
    ]
  }
};

export default function StudioPage() {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [selectedScene, setSelectedScene] = useState(scenes[0]);
  const [lightIntensity, setLightIntensity] = useState(0.85);
  const [activeObject, setActiveObject] = useState('sofa'); // object currently being customized

  // Selection configurations
  const [selections, setSelections] = useState({
    sofa: customizableObjects.sofa.materials[0],
    tray: customizableObjects.tray.materials[0],
    lamp: customizableObjects.lamp.materials[0]
  });

  // Position placements on 3D grid
  const [positions, setPositions] = useState({
    sofa: { x: 50, y: 55, size: 220 },
    tray: { x: 180, y: 70, size: 80 },
    lamp: { x: 260, y: 40, size: 100 }
  });

  const handleMaterialChange = (objKey, material) => {
    setSelections(prev => ({
      ...prev,
      [objKey]: material
    }));
  };

  const handleDrag = (objKey, direction) => {
    setPositions(prev => {
      const step = 15;
      let newX = prev[objKey].x;
      let newY = prev[objKey].y;

      if (direction === 'up') newY -= step;
      if (direction === 'down') newY += step;
      if (direction === 'left') newX -= step;
      if (direction === 'right') newX += step;

      return {
        ...prev,
        [objKey]: { ...prev[objKey], x: newX, y: newY }
      };
    });
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(customizableObjects).forEach(key => {
      total += customizableObjects[key].price + selections[key].extraPrice;
    });
    return total;
  };

  const handleAddConfigurationToCart = () => {
    // Add all 3 items with customized specifications to cart
    Object.keys(customizableObjects).forEach(key => {
      const item = {
        id_producto: key === 'sofa' ? 7 : key === 'tray' ? 1 : 5,
        nombre: `${customizableObjects[key].name} (${selections[key].name})`,
        precio: customizableObjects[key].price + selections[key].extraPrice,
        url_imagen: selections[key].img
      };
      addItem(item);
    });

    showToast('¡Configuración de Studio 3D añadida al carrito!', 'success');
  };

  return (
    <div className="container section-padding" id="studio-page">
      <div style={{ marginBottom: '32px' }}>
        <span className="hero-label">DISEÑO Y PERSONALIZACIÓN</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginTop: '6px' }}>
          Nexa Studio 3D
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '8px' }}>
          Diseña tu espacio ideal. Elige tu ambiente, personaliza los materiales de cada pieza y visualiza la armonía de tus muebles en tiempo real.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px' }} className="profile-grid">
        
        {/* COLUMNA IZQUIERDA: CANVAS INTERACTIVO 3D */}
        <div>
          <div
            className="studio-canvas"
            style={{
              position: 'relative',
              width: '100%',
              height: '480px',
              backgroundColor: selectedScene.bg,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 80px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.05)',
              transition: 'all 0.4s ease'
            }}
          >
            {/* Capa de pared/suelo para perspectiva de habitación */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '65%',
                backgroundColor: selectedScene.wall,
                borderBottom: '4px solid rgba(0,0,0,0.08)'
              }}
            />

            {/* Simulación de iluminación ambiental */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#FFFBEB',
                opacity: Math.max(0, 1 - lightIntensity),
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Simulación de foco de luz solar */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                left: '10%',
                width: '300px',
                height: '500px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                transform: 'rotate(25deg)',
                pointerEvents: 'none'
              }}
            />

            {/* 🛋️ OBJETO 1: SOFÁ MODULAR */}
            <div
              style={{
                position: 'absolute',
                left: `${positions.sofa.x}px`,
                top: `${positions.sofa.y}%`,
                width: `${positions.sofa.size}px`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                filter: activeObject === 'sofa' ? 'drop-shadow(0 0 8px var(--accent))' : 'drop-shadow(0 15px 15px rgba(0,0,0,0.15))'
              }}
              onClick={() => setActiveObject('sofa')}
            >
              {/* Overlay de color dinámico para simular material */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: selections.sofa.color,
                  mixBlendMode: 'color',
                  borderRadius: '10px',
                  opacity: 0.85
                }}
              />
              <img
                src="/images/products/green_sofa.png"
                alt="Sofá"
                style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
              />
            </div>

            {/* 🪞 OBJETO 2: BANDEJA DE TRAVERTINO */}
            <div
              style={{
                position: 'absolute',
                left: `${positions.tray.x}px`,
                top: `${positions.tray.y}%`,
                width: `${positions.tray.size}px`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                filter: activeObject === 'tray' ? 'drop-shadow(0 0 8px var(--accent))' : 'drop-shadow(0 5px 5px rgba(0,0,0,0.12))'
              }}
              onClick={() => setActiveObject('tray')}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: selections.tray.color,
                  mixBlendMode: 'color',
                  borderRadius: '50%',
                  opacity: 0.8
                }}
              />
              <img
                src="/images/products/travertine_tray.png"
                alt="Bandeja"
                style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
              />
            </div>

            {/* 💡 OBJETO 3: LÁMPARA DE ESCRITORIO */}
            <div
              style={{
                position: 'absolute',
                left: `${positions.lamp.x}px`,
                top: `${positions.lamp.y}%`,
                width: `${positions.lamp.size}px`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                filter: activeObject === 'lamp' ? 'drop-shadow(0 0 8px var(--accent))' : 'drop-shadow(0 10px 8px rgba(0,0,0,0.12))'
              }}
              onClick={() => setActiveObject('lamp')}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: selections.lamp.color,
                  mixBlendMode: 'color',
                  opacity: 0.7
                }}
              />
              <img
                src="/images/products/desk_lamp.png"
                alt="Lámpara"
                style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
              />
            </div>

            {/* Selector de perspectiva interactivo */}
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
              {scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScene(s)}
                  style={{
                    backgroundColor: selectedScene.id === s.id ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
                    color: selectedScene.id === s.id ? '#FFFFFF' : '#1A1A1A',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Controles de Posicionamiento del Objeto Activo */}
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '12px', zIndex: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '4px', textTransform: 'uppercase' }}>
                MOVER: {customizableObjects[activeObject].name.split(' ')[0]}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gap: '4px' }}>
                <div />
                <button onClick={() => handleDrag(activeObject, 'up')} style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>▲</button>
                <div />
                <button onClick={() => handleDrag(activeObject, 'left')} style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>◀</button>
                <div />
                <button onClick={() => handleDrag(activeObject, 'right')} style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>▶</button>
                <div />
                <button onClick={() => handleDrag(activeObject, 'down')} style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>▼</button>
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE PERSONALIZACIÓN Y COMPRA */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '20px' }}>Personalizador</h2>

          {/* Configuración de Iluminación */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LUZ SOLAR / INTENSIDAD</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700' }}>{Math.round(lightIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
              SELECCIONA ELEMENTO PARA PERSONALIZAR:
            </span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {Object.keys(customizableObjects).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveObject(key)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: activeObject === key ? '2px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: activeObject === key ? '#FDF8F5' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: activeObject === key ? '700' : '400'
                  }}
                >
                  {customizableObjects[key].name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Materiales/Texturas Disponibles del Objeto Activo */}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              MATERIAL / COLOR PARA {customizableObjects[activeObject].name.toUpperCase()}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customizableObjects[activeObject].materials.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleMaterialChange(activeObject, m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    border: selections[activeObject].name === m.name ? '2px solid #1A1A1A' : '1px solid var(--border)',
                    backgroundColor: selections[activeObject].name === m.name ? '#F8F8F8' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: m.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{m.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: m.extraPrice > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {m.extraPrice > 0 ? `+$${m.extraPrice}` : 'Incluido'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desglose de Precios */}
          <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '20px', marginBottom: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '12px' }}>Resumen de Espacio</h4>
            {Object.keys(customizableObjects).map(key => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>{customizableObjects[key].name} ({selections[key].name})</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  ${(customizableObjects[key].price + selections[key].extraPrice).toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <span>Total Conjunto:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddConfigurationToCart}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '0.8rem', letterSpacing: '1.5px' }}
          >
            AÑADIR CONJUNTO AL CARRITO
          </button>
        </div>

      </div>
    </div>
  );
}
