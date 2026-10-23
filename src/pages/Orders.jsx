import { Link } from '../router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrder, getOrders } from '../data/mockApi.js';
import { formatBRL } from '../utils/format.js';

const METODOS = { cartao: 'Cartão de crédito', pix: 'Pix', boleto: 'Boleto' };
const dataBR = (iso) => new Date(iso).toLocaleString('pt-BR');

export function OrderConfirmation({ params }) {
  const { user } = useAuth();
  const pedido = getOrder(params.numero);

  if (!pedido || pedido.userId !== user.id) {
    return (
      <div className="page" data-testid="page-pedido-nao-encontrado">
        <div className="card vazio"><h1>Pedido não encontrado</h1></div>
      </div>
    );
  }

  return (
    <div className="page narrow" data-testid="page-pedido">
      <div className="card center">
        <div className="sucesso-icone">✓</div>
        <h1 data-testid="order-success-title">Pedido realizado com sucesso!</h1>
        <p>
          Número do pedido: <strong data-testid="order-number">{pedido.numero}</strong>
        </p>
        <p className="muted" data-testid="order-status">{pedido.status}</p>
        <p>
          Total: <strong data-testid="order-total">{formatBRL(pedido.totais.total)}</strong> —{' '}
          <span data-testid="order-payment">
            {METODOS[pedido.pagamento.metodo]}
            {pedido.pagamento.metodo === 'cartao' && ` em ${pedido.pagamento.parcelas}x`}
          </span>
        </p>
        {pedido.pagamento.metodo === 'pix' && (
          <code className="pix" data-testid="order-pix-code">00020126MOCKPIX{pedido.numero}5204000053039865802BR</code>
        )}
        {pedido.pagamento.metodo === 'boleto' && (
          <code className="pix" data-testid="order-boleto-code">34191.79001 01043.510047 91020.150008 {pedido.numero.slice(0, 1)} 9{pedido.numero}0000</code>
        )}
        <div className="cart-actions center">
          <Link to="/catalogo" className="btn btn-primary" data-testid="order-continue-shopping">Continuar comprando</Link>
          <Link to="/meus-pedidos" className="btn" data-testid="order-view-orders">Meus pedidos</Link>
        </div>
      </div>
    </div>
  );
}

export function Orders() {
  const { user } = useAuth();
  const pedidos = getOrders(user.id);

  return (
    <div className="page" data-testid="page-pedidos">
      <h1>Meus pedidos</h1>
      {pedidos.length === 0 ? (
        <div className="card vazio" data-testid="orders-empty">
          <p>Você ainda não fez nenhum pedido.</p>
          <Link to="/catalogo" className="btn btn-primary">Ver produtos</Link>
        </div>
      ) : (
        <div className="table-wrap card">
          <table data-testid="orders-table">
            <thead>
              <tr><th>Pedido</th><th>Data</th><th>Itens</th><th>Pagamento</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.numero} data-testid={`order-row-${p.numero}`}>
                  <td><Link to={`/pedido/${p.numero}`}>#{p.numero}</Link></td>
                  <td>{dataBR(p.data)}</td>
                  <td>{p.itens.reduce((s, i) => s + i.qtd, 0)}</td>
                  <td>{METODOS[p.pagamento.metodo]}</td>
                  <td>{p.status}</td>
                  <td>{formatBRL(p.totais.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
