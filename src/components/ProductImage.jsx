const ICONES = { 'Eletrônicos': '🎧', Livros: '📘', Casa: '🏠', Esportes: '🏃' };

/** Imagem gerada em SVG — nada de rede, sempre determinística. */
export default function ProductImage({ produto, size = 'md' }) {
  const gid = `g${produto.id}`;
  return (
    <svg
      className={`product-img product-img-${size}`}
      viewBox="0 0 200 150"
      role="img"
      aria-label={produto.nome}
      data-testid={`product-image-${produto.id}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={produto.cor} stopOpacity="0.9" />
          <stop offset="1" stopColor={produto.cor} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${gid})`} />
      <circle cx="160" cy="25" r="45" fill="#fff" opacity="0.12" />
      <text x="100" y="88" textAnchor="middle" fontSize="54">
        {ICONES[produto.categoria] || '📦'}
      </text>
    </svg>
  );
}
