import { useState } from 'react';
import { Link, navigate, Redirect } from '../router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiPlaceOrder } from '../data/mockApi.js';
import OrderSummary from '../components/OrderSummary.jsx';
import Field from '../components/Field.jsx';
import { formatBRL, maskCard, maskExpiry, maskCEP, onlyDigits } from '../utils/format.js';

function validarCartao(c) {
  const e = {};
  if (onlyDigits(c.numero).length !== 16) e.numero = 'Número do cartão inválido.';
  if (c.nome.trim().length < 3) e.nome = 'Informe o nome impresso no cartão.';
  const m = /^(\d{2})\/(\d{2})$/.exec(c.validade);
  if (!m || +m[1] < 1 || +m[1] > 12) e.validade = 'Validade inválida (MM/AA).';
  else {
    const fim = new Date(2000 + +m[2], +m[1], 0, 23, 59, 59);
    if (fim < new Date()) e.validade = 'Cartão vencido.';
  }
  if (!/^\d{3,4}$/.test(c.cvv)) e.cvv = 'CVV inválido.';
  return e;
}

export default function Checkout() {
  const { user } = useAuth();
  const { itens, totais, cupom, clear } = useCart();
  const [metodo, setMetodo] = useState('cartao');
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: '1' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  if (itens.length === 0 && !finalizado) return <Redirect to="/carrinho" />;

  const setC = (campo, valor) => {
    setCartao((s) => ({ ...s, [campo]: valor }));
    if (erros[campo]) setErros((s) => ({ ...s, [campo]: undefined }));
  };

  const maxParcelas = Math.max(1, Math.min(10, Math.floor(totais.total / 50)));

  const confirmar = async () => {
    setErroGeral('');
    if (metodo === 'cartao') {
      const err = validarCartao(cartao);
      setErros(err);
      if (Object.keys(err).length) return;
    }
    setEnviando(true);
    try {
      const pedido = await apiPlaceOrder({
        userId: user.id,
        itens: itens.map(({ id, qtd, produto }) => ({ id, qtd, nome: produto.nome, preco: produto.preco })),
        totais,
        pagamento: { metodo, ...cartao, parcelas: metodo === 'cartao' ? +cartao.parcelas : 1 },
      });
      setFinalizado(true);
      clear();
      navigate(`/pedido/${pedido.numero}`, { replace: true });
    } catch (ex) {
      setErroGeral(ex.message);
    } finally {
      setEnviando(false);
    }
  };

  const cardInput = (campo, props) => (
    <input
      id={`checkout-card-${campo}`}
      data-testid={`checkout-card-${campo}`}
      value={cartao[campo]}
      onChange={(e) => setC(campo, e.target.value)}
      {...props}
    />
  );

  return (
    <div className="page" data-testid="page-checkout">
      <h1>Finalizar compra</h1>
      <div className="layout-checkout">
        <section>
          <div className="card">
            <div className="card-head">
              <h2>Endereço de entrega</h2>
              <Link to="/meu-cadastro" data-testid="checkout-edit-address">Alterar</Link>
            </div>
            <address data-testid="checkout-address">
              {user.nome}<br />
              {user.logradouro}, {user.numero}{user.complemento && ` — ${user.complemento}`}<br />
              {user.bairro} — {user.cidade}/{user.uf}<br />
              CEP {maskCEP(user.cep)}
            </address>
          </div>

          <div className="card">
            <h2>Pagamento</h2>
            {erroGeral && (
              <div className="alert alert-erro" role="alert" data-testid="checkout-error">{erroGeral}</div>
            )}
            <div className="radios" role="radiogroup" aria-label="Forma de pagamento">
              {[
                ['cartao', 'Cartão de crédito'],
                ['pix', 'Pix'],
                ['boleto', 'Boleto'],
              ].map(([v, l]) => (
                <label key={v} className={`radio ${metodo === v ? 'sel' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    value={v}
                    id={`checkout-payment-${v}`}
                    data-testid={`checkout-payment-${v}`}
                    checked={metodo === v}
                    onChange={() => { setMetodo(v); setErros({}); setErroGeral(''); }}
                  />
                  {l}
                </label>
              ))}
            </div>

            {metodo === 'cartao' && (
              <div className="grid-2" data-testid="checkout-card-form">
                <Field id="checkout-card-numero" label="Número do cartão" error={erros.numero} className="span-2"
                  hint="Teste: 4111 1111 1111 1111 (aprovado) · final 0000 (recusado)">
                  {cardInput('numero', { inputMode: 'numeric', autoComplete: 'off', onChange: (e) => setC('numero', maskCard(e.target.value)) })}
                </Field>
                <Field id="checkout-card-nome" label="Nome impresso" error={erros.nome} className="span-2">
                  {cardInput('nome', { autoComplete: 'off', onChange: (e) => setC('nome', e.target.value.toUpperCase()) })}
                </Field>
                <Field id="checkout-card-validade" label="Validade (MM/AA)" error={erros.validade}>
                  {cardInput('validade', { inputMode: 'numeric', placeholder: 'MM/AA', onChange: (e) => setC('validade', maskExpiry(e.target.value)) })}
                </Field>
                <Field id="checkout-card-cvv" label="CVV" error={erros.cvv}>
                  {cardInput('cvv', { inputMode: 'numeric', maxLength: 4, onChange: (e) => setC('cvv', onlyDigits(e.target.value).slice(0, 4)) })}
                </Field>
                <Field id="checkout-card-parcelas" label="Parcelas" className="span-2">
                  <select
                    id="checkout-card-parcelas"
                    data-testid="checkout-card-parcelas"
                    value={cartao.parcelas}
                    onChange={(e) => setC('parcelas', e.target.value)}
                  >
                    {Array.from({ length: maxParcelas }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(totais.total / n)} sem juros
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            {metodo === 'pix' && (
              <p className="alert alert-info" data-testid="checkout-pix-info">
                O QR Code Pix será exibido após a confirmação. Pagamento aprovado na hora.
              </p>
            )}
            {metodo === 'boleto' && (
              <p className="alert alert-info" data-testid="checkout-boleto-info">
                O boleto vence em 3 dias úteis. O pedido será liberado após a compensação.
              </p>
            )}
          </div>
        </section>

        <OrderSummary totais={totais} cupom={cupom}>
          <ul className="resumo-itens" data-testid="checkout-items">
            {itens.map(({ id, qtd, produto }) => (
              <li key={id} data-testid={`checkout-item-${id}`}>
                <span>{qtd}x {produto.nome}</span>
                <span>{formatBRL(produto.preco * qtd)}</span>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary btn-block" disabled={enviando} onClick={confirmar} data-testid="checkout-submit">
            {enviando ? 'Processando...' : 'Confirmar pedido'}
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
