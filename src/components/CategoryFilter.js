'use client';

const categories = [
  { id: null, name: 'TODOS' },
  { id: 1, name: 'CERÁMICA' },
  { id: 2, name: 'TEXTILES' },
  { id: 3, name: 'ILUMINACIÓN' },
  { id: 4, name: 'MUEBLES' },
  { id: 5, name: 'OBJETOS' }
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-filter" id="category-filter" role="toolbar" aria-label="Filtrar por categoría">
      <span className="category-filter-label">Filtrar:</span>
      <div className="category-filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
            aria-pressed={activeCategory === cat.id}
            id={`filter-${cat.name.toLowerCase()}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
