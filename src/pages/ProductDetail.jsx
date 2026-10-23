import { useState } from 'react';
import { Link } from '../router.jsx';
import { getProduto } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { formatBRL } from '../utils/format.js';

export default function ProductDetail({ params }) {
  const p = getProduto(params.id);
  const { add } = useCart();
  const toast = useToast();
  const [qtd, setQtd] = useState(1);

  if (!p) {
    return (
      <div className="page" data-testid="page-produto-nao-encontrado">
        <div className="card vazio">
          <h1>Produto não encontrado</h1>
          <Link to="/catalogo" className="btn">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  const esgotado = p.estoque === 0;

  const adicionar = () => {
    const ok = add(p.id, qtd);
    toast(ok ? `${qtd}x ${p.nome} adicionado ao carrinho.` : 'Quantidade limitada ao estoque disponível.', ok ? 'sucesso' : 'erro');
  };

  return (
    <div className="page" data-testid="page-produto">
      <Link to="/catalogo" className="voltar" data-testid="product-back">← Voltar ao catálogo</Link>
      <div className="card detalhe">
        <ProductImage produto={p} size="lg" />
        <div className="detalhe-info">
          <span className="tag">{p.categoria}</span>
          <h1 data-testid="product-detail-name">{p.nome}</h1>
          <p className="muted" data-testid="product-detail-description">{p.descricao}</p>
          <div className="preco preco-lg" data-testid="product-detail-price">{formatBRL(p.preco)}</div>
          <p className={esgotado ? 'estoque esgotado' : 'estoque'} data-testid="product-detail-stock">
            {esgotado ? 'Produto esgotado' : `${p.estoque} unidades em estoque`}
          </p>

          {!esgotado && (
            <div className="qtd-row">
              <div className="qtd" role="group" aria-label="Quantidade">
                <button className="btn" data-testid="product-qty-decrease" disabled={qtd <= 1} onClick={() => setQtd(qtd - 1)}>−</button>
                <span data-testid="product-qty">{qtd}</span>
                <button className="btn" data-testid="product-qty-increase" disabled={qtd >= p.estoque} onClick={() => setQtd(qtd + 1)}>+</button>
              </div>
              <button className="btn btn-primary" data-testid="product-detail-add" onClick={adicionar}>
                Adicionar ao carrinho
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
