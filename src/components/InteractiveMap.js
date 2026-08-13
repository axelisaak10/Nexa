'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Truck, ShieldCheck, Clock, Layers, ArrowUpRight, RefreshCw } from 'lucide-react';

const SHIPMENT_NODES = [
  { id: 1, city: 'Ciudad de México (HQ)', lat: 19.4326, lng: -99.1332, x: 42, y: 55, orders: 42, status: 'Showroom Principal', carrier: 'Nexa Express', time: 'Mismo día', active: true },
  { id: 2, city: 'Guadalajara, JAL', lat: 20.6597, lng: -103.3496, x: 30, y: 52, orders: 18, status: 'En Tránsito', carrier: 'DHL Express', time: '24 hrs', active: true },
  { id: 3, city: 'Monterrey, N.L.', lat: 25.6866, lng: -100.3161, x: 44, y: 32, orders: 25, status: 'En Tránsito', carrier: 'FedEx Air', time: '24-48 hrs', active: true },
  { id: 4, city: 'Querétaro, QRO', lat: 20.5888, lng: -100.3899, x: 40, y: 50, orders: 12, status: 'Entregado', carrier: 'Estafeta', time: 'Completado', active: false },
  { id: 5, city: 'Puebla, PUE', lat: 19.0414, lng: -98.2063, x: 46, y: 57, orders: 9, status: 'En Tránsito', carrier: 'DHL Express', time: '24 hrs', active: true },
  { id: 6, city: 'Mérida, YUC', lat: 20.9674, lng: -89.5926, x: 75, y: 54, orders: 14, status: 'En Centro de Distribución', carrier: 'FedEx Cargo', time: '48 hrs', active: true },
  { id: 7, city: 'Cancún, Q.R.', lat: 21.1619, lng: -86.8515, x: 82, y: 52, orders: 11, status: 'En Tránsito', carrier: 'Nexa Priority', time: '48 hrs', active: true },
  { id: 8, city: 'Tijuana, B.C.', lat: 32.5149, lng: -117.0382, x: 12, y: 15, orders: 8, status: 'Procesando', carrier: 'Estafeta Air', time: '3 Días', active: true },
];

export default function InteractiveMap({ title = "Mapa de Distribución y Envíos en Tiempo Real" }) {
  const [selectedNode, setSelectedNode] = useState(SHIPMENT_NODES[0]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'transit', 'delivered'

  const filteredNodes = SHIPMENT_NODES.filter(node => {
    if (filterStatus === 'transit') return node.status.includes('Tránsito') || node.status.includes('Procesando');
    if (filterStatus === 'delivered') return node.status === 'Entregado' || node.status.includes('Principal');
    return true;
  });

  const totalActiveShipments = SHIPMENT_NODES.reduce((sum, n) => sum + n.orders, 0);

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6DEC9',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        marginBottom: '32px'
      }}
    >
      {/* Header section */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '18px',
          borderBottom: '1px solid #F3EDE4'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MapPin size={20} style={{ color: 'var(--accent, #C85A2A)' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
              {title}
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#736B60', margin: 0 }}>
            Seguimiento geográfico de paquetes, nodos logísticos y cobertura de despacho Nexa
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F8F4EE', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filterStatus === 'all' ? '#FFFFFF' : 'transparent',
              color: filterStatus === 'all' ? '#C85A2A' : '#736B60',
              boxShadow: filterStatus === 'all' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Todos ({SHIPMENT_NODES.length})
          </button>

          <button
            onClick={() => setFilterStatus('transit')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filterStatus === 'transit' ? '#FFFFFF' : 'transparent',
              color: filterStatus === 'transit' ? '#1E6B5C' : '#736B60',
              boxShadow: filterStatus === 'transit' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            En Tránsito
          </button>

          <button
            onClick={() => setFilterStatus('delivered')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filterStatus === 'delivered' ? '#FFFFFF' : 'transparent',
              color: filterStatus === 'delivered' ? '#7C3AED' : '#736B60',
              boxShadow: filterStatus === 'delivered' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Showrooms & Entregados
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}
      >
        {/* Visual Map Canvas / Vector Layout */}
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            backgroundColor: '#F5F0E8',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #E6DEC9',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)'
          }}
        >
          {/* Subtle Grid Map Texture */}
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              opacity: 0.4, 
              backgroundImage: 'radial-gradient(#C8BFB0 1.2px, transparent 1.2px)', 
              backgroundSize: '20px 20px' 
            }} 
          />

          {/* SVG Connection Lines from HQ (Node 1) to Destinations */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {filteredNodes.map((node) => {
              if (node.id === 1) return null;
              const hq = SHIPMENT_NODES[0];
              return (
                <g key={`line-${node.id}`}>
                  <line 
                    x1={`${hq.x}%`} 
                    y1={`${hq.y}%`} 
                    x2={`${node.x}%`} 
                    y2={`${node.y}%`} 
                    stroke="#C85A2A" 
                    strokeWidth="1.8" 
                    strokeDasharray="4 4" 
                    strokeOpacity="0.4"
                  />
                  {/* Animated Pulses along routes */}
                  <circle r="3" fill="#C85A2A">
                    <animateMotion
                      path={`M${hq.x * 3.5},${hq.y * 2.5} L${node.x * 3.5},${node.y * 2.5}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Interactive Map Nodes / Pins */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isHq = node.id === 1;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 10 : 5,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Pulsing ring for selected or HQ */}
                {(isSelected || isHq) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-8px',
                      borderRadius: '50%',
                      backgroundColor: isHq ? 'rgba(200, 90, 42, 0.25)' : 'rgba(30, 107, 92, 0.25)',
                      animation: 'pulseRing 2s infinite ease-out'
                    }}
                  />
                )}

                {/* Marker Button */}
                <div
                  style={{
                    backgroundColor: isHq ? '#C85A2A' : isSelected ? '#1E6B5C' : '#FFFFFF',
                    color: (isHq || isSelected) ? '#FFFFFF' : '#1A1A1A',
                    padding: isSelected ? '6px 12px' : '4px 8px',
                    borderRadius: '20px',
                    border: `2px solid ${isHq ? '#9E3F18' : isSelected ? '#0E483E' : '#C85A2A'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <MapPin size={12} fill={isHq ? '#FFFFFF' : 'none'} />
                  <span>{node.city.split(',')[0]}</span>
                </div>
              </div>
            );
          })}

          {/* Map Compass Watermark */}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '16px', 
              left: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '0.7rem',
              color: '#8C8478',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Navigation size={12} />
            <span>NEXA LOGISTICS MAP • COBERTURA NACIONAL</span>
          </div>

          {/* Live indicator badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #E5DCD0',
              fontSize: '0.72rem',
              fontWeight: '600',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', animation: 'blink 1.5s infinite' }} />
            GPS EN VIVO CONECTADO
          </div>
        </div>

        {/* Selected Location Information Card */}
        <div 
          style={{ 
            backgroundColor: '#FAF7F2', 
            borderRadius: '14px', 
            padding: '24px',
            border: '1px solid #EFE8DC',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#8C8478', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                  DESTINO SELECCIONADO
                </span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '700', color: '#1A1A1A', margin: '4px 0 0 0' }}>
                  {selectedNode.city}
                </h4>
              </div>
              <span 
                style={{ 
                  backgroundColor: selectedNode.id === 1 ? '#FFEDD5' : '#DCFCE7', 
                  color: selectedNode.id === 1 ? '#C85A2A' : '#15803D',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Info metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E8E0D5' }}>
                <span style={{ fontSize: '0.7rem', color: '#8C8478', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', display: 'block' }}>PEDIDOS ACTIVOS</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A1A1A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} style={{ color: '#C85A2A' }} />
                  {selectedNode.orders} Paquetes
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E8E0D5' }}>
                <span style={{ fontSize: '0.7rem', color: '#8C8478', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', display: 'block' }}>TIEMPO DE ENTREGA</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A1A1A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: '#1E6B5C' }} />
                  {selectedNode.time}
                </div>
              </div>
            </div>

            {/* Logistics provider details */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E8E0D5', fontSize: '0.82rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#736B60' }}>Transportista Oficial:</span>
                <strong style={{ color: '#1A1A1A' }}>{selectedNode.carrier}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#736B60' }}>Coordenadas GPS:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#4A443C' }}>{selectedNode.lat.toFixed(4)}°N, {Math.abs(selectedNode.lng).toFixed(4)}°W</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#736B60' }}>Garantía de Entrega:</span>
                <span style={{ color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> 100% Protegido
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-primary" 
              style={{ flex: 1, fontSize: '0.75rem', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => alert(`Rastreando envíos activos para ${selectedNode.city}...`)}
            >
              RASTREAR ENVÍOS DE {selectedNode.city.split(',')[0].toUpperCase()}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer stats strip */}
      <div 
        style={{ 
          marginTop: '20px', 
          paddingTop: '16px', 
          borderTop: '1px solid #F3EDE4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#736B60'
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Total envíos en ruta: <strong style={{ color: '#1A1A1A' }}>{totalActiveShipments} paquetes</strong></span>
          <span>Cobertura nacional: <strong style={{ color: '#1A1A1A' }}>32 estados</strong></span>
          <span>Eficiencia de entrega: <strong style={{ color: '#16A34A' }}>99.2%</strong></span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
          API de Rastreo • Envíos Supabase Logistics
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
