import { useState } from 'react';
import { Link, navigate } from '../router.jsx';
import { useCart, FRETE_GRATIS_A_PARTIR } from '../context/CartContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { formatBRL } from '../utils/format.js';

export default function Cart() {
  const { itens, totais, cupom, setQtd, remove, clear, applyCoupon, removeCoupon } = useCart();
  const [codigo, setCodigo] = useState('');
  const [erroCupom, setErroCupom] = useState('');

  if (itens.length === 0) {
    return (
      <div className="page" data-testid="page-carrinho">
        <h1>Carrinho</h1>
        <div className="card vazio" data-testid="cart-empty">
          <p>Seu carrinho está vazio.</p>
          <Link to="/catalogo" className="btn btn-primary" data-testid="cart-continue-shopping">
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  const aplicar = (e) => {
    e.preventDefault();
    const err = applyCoupon(codigo);
    setErroCupom(err || '');
    if (!err) setCodigo('');
  };

  const faltaFrete = FRETE_GRATIS_A_PARTIR - totais.subtotal;

  return (
    <div className="page" data-testid="page-carrinho">
      <h1>Carrinho</h1>
      <div className="layout-checkout">
        <section>
          <ul className="cart-list" data-testid="cart-list">
            {itens.map(({ id, qtd, produto: p }) => (
              <li key={id} className="card cart-item" data-testid={`cart-item-${id}`}>
                <ProductImage produto={p} size="sm" />
                <div className="cart-item-info">
                  <Link to={`/produto/${id}`} data-testid={`cart-item-name-${id}`}>{p.nome}</Link>
                  <span className="muted" data-testid={`cart-item-unit-price-${id}`}>{formatBRL(p.preco)} un.</span>
                </div>
                <div className="qtd" role="group" aria-label={`Quantidade de ${p.nome}`}>
                  <button className="btn" data-testid={`cart-decrease-${id}`} onClick={() => setQtd(id, qtd - 1)} aria-label="Diminuir">−</button>
                  <span data-testid={`cart-qty-${id}`}>{qtd}</span>
                  <button className="btn" data-testid={`cart-increase-${id}`} disabled={qtd >= p.estoque} onClick={() => setQtd(id, qtd + 1)} aria-label="Aumentar">+</button>
                </div>
                <strong className="cart-item-total" data-testid={`cart-item-total-${id}`}>{formatBRL(p.preco * qtd)}</strong>
                <button className="btn btn-link remover" data-testid={`cart-remove-${id}`} onClick={() => remove(id)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-actions">
            <Link to="/catalogo" className="btn" data-testid="cart-continue-shopping">Continuar comprando</Link>
            <button className="btn btn-link" data-testid="cart-clear" onClick={clear}>Esvaziar carrinho</button>
          </div>
        </section>

        <OrderSummary totais={totais} cupom={cupom}>
          {faltaFrete > 0 && cupom?.tipo !== 'frete' && (
            <p className="hint" data-testid="cart-free-shipping-hint">
              Faltam {formatBRL(faltaFrete)} para frete grátis.
            </p>
          )}

          {cupom ? (
            <div className="cupom-aplicado" data-testid="coupon-applied">
              Cupom <strong>{cupom.codigo}</strong> — {cupom.descricao}
              <button className="btn btn-link" data-testid="coupon-remove" onClick={removeCoupon}>remover</button>
            </div>
          ) : (
            <form className="cupom" onSubmit={aplicar} noValidate>
              <label htmlFor="coupon-input">Cupom de desconto</label>
              <div className="input-group">
                <input
                  id="coupon-input"
                  data-testid="coupon-input"
                  placeholder="Ex.: DESCONTO10"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <button className="btn" type="submit" data-testid="coupon-apply">Aplicar</button>
              </div>
              {erroCupom && <small className="error-text" role="alert" data-testid="coupon-error">{erroCupom}</small>}
            </form>
          )}

          <button className="btn btn-primary btn-block" data-testid="cart-checkout" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
