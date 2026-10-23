import { formatBRL } from '../utils/format.js';

export default function OrderSummary({ totais, cupom, children }) {
  return (
    <aside className="card resumo" data-testid="order-summary">
      <h2>Resumo</h2>
      <dl>
        <dt>Subtotal ({totais.quantidade} {totais.quantidade === 1 ? 'item' : 'itens'})</dt>
        <dd data-testid="summary-subtotal">{formatBRL(totais.subtotal)}</dd>
        {totais.desconto > 0 && (
          <>
            <dt>Desconto {cupom && `(${cupom.codigo})`}</dt>
            <dd className="desconto" data-testid="summary-discount">− {formatBRL(totais.desconto)}</dd>
          </>
        )}
        <dt>Frete</dt>
        <dd data-testid="summary-shipping">{totais.frete === 0 ? 'Grátis' : formatBRL(totais.frete)}</dd>
        <dt className="total">Total</dt>
        <dd className="total" data-testid="summary-total">{formatBRL(totais.total)}</dd>
      </dl>
      {children}
    </aside>
  );
}
