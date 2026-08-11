'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then(d => { if (d.banners?.length) setBanners(d.banners); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners.length) return null;

  return (
    <div className="banner-carousel" aria-label="Banners promocionales">
      <div className="banner-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((b) => (
          <Link key={b.id_banner} href={b.url_destino || '/shop'} className="banner-slide">
            <div className="banner-slide-content">
              <h2 className="banner-slide-title">{b.titulo}</h2>
              <p className="banner-slide-sub">{b.subtitulo}</p>
              <span className="banner-slide-cta">Ver colección →</span>
            </div>
            <div className="banner-slide-image-wrap">
              <Image src={b.url_imagen || '/images/products/travertine_tray.png'} alt={b.titulo || ''} fill className="banner-slide-img" style={{ objectFit: 'cover' }} />
            </div>
          </Link>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, i) => (
            <button key={i} className={`banner-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} aria-label={`Banner ${i+1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
