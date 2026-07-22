export default function AboutPage() {
  return (
    <div className="container section-padding">
      <div className="about-page" id="about-page">
        <div className="about-hero">
          <span className="hero-label">NUESTRA HISTORIA</span>
          <h1 className="about-title">
            Creemos en objetos que{' '}
            <span className="hero-title-accent">importan.</span>
          </h1>
          <p className="about-description">
            Nexa fue fundada sobre un principio simple: rodearte solo de cosas que sirvan un propósito
            y aporten una satisfacción genuina. Cada objeto de nuestra colección ha sido seleccionado
            por su integridad material, la habilidad de su creador y su capacidad para mejorar la vida diaria.
          </p>
        </div>

        <div className="about-values">
          <div className="about-value-card">
            <h3 className="about-value-title">Honestidad Material</h3>
            <p className="about-value-text">
              Priorizamos materiales naturales — piedra, arcilla, lino, madera, metal — en su forma más auténtica.
              Sin atajos sintéticos ni recubrimientos innecesarios.
            </p>
          </div>
          <div className="about-value-card">
            <h3 className="about-value-title">Trabajo Artesanal</h3>
            <p className="about-value-text">
              Cada pieza está hecha por manos expertas. Trabajamos directamente con artesanos y pequeños estudios
              que comparten nuestro compromiso con la calidad sobre la cantidad.
            </p>
          </div>
          <div className="about-value-card">
            <h3 className="about-value-title">Diseño Consciente</h3>
            <p className="about-value-text">
              Sin excesos. Sin ruido. Cada objeto gana su lugar a través de un diseño pensado que equilibra
              forma y función.
            </p>
          </div>
        </div>

        <div className="about-cta">
          <h2 className="about-cta-title">¿Tienes preguntas?</h2>
          <p className="about-cta-text">Nos encantaría escucharte.</p>
          <a href="/contact" className="btn-primary">CONTÁCTANOS</a>
        </div>
      </div>
    </div>
  );
}
