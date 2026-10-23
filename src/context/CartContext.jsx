import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduto } from '../data/products.js';
import { CUPONS } from '../data/mockApi.js';
import { load, save } from '../utils/storage.js';

const CartContext = createContext(null);

export const FRETE_PADRAO = 19.9;
export const FRETE_GRATIS_A_PARTIR = 299;

export function CartProvider({ children }) {
  const [itens, setItens] = useState(() => load('cart', [])); // [{ id, qtd }]
  const [cupom, setCupom] = useState(() => load('coupon', null));

  useEffect(() => save('cart', itens), [itens]);
  useEffect(() => save('coupon', cupom), [cupom]);

  const add = (id, qtd = 1) => {
    const p = getProduto(id);
    if (!p || p.estoque === 0) return false;
    const atual = itens.find((i) => i.id === id);
    const nova = (atual?.qtd || 0) + qtd;
    const limitada = Math.min(nova, p.estoque);
    setItens((prev) =>
      prev.some((i) => i.id === id)
        ? prev.map((i) => (i.id === id ? { ...i, qtd: limitada } : i))
        : [...prev, { id, qtd: limitada }]
    );
    return nova <= p.estoque; // false = estoque insuficiente (quantidade foi limitada)
  };

  const setQtd = (id, qtd) => {
    const p = getProduto(id);
    if (qtd <= 0) return remove(id);
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, qtd: Math.min(qtd, p.estoque) } : i)));
  };

  const remove = (id) => setItens((prev) => prev.filter((i) => i.id !== id));

  const clear = () => {
    setItens([]);
    setCupom(null);
  };

  /** Retorna mensagem de erro ou null em caso de sucesso. */
  const applyCoupon = (codigo) => {
    const code = codigo.trim().toUpperCase();
    if (!code) return 'Informe um cupom.';
    const c = CUPONS[code];
    if (!c) return 'Cupom inválido.';
    if (c.expirado) return 'Cupom expirado.';
    setCupom({ codigo: code, ...c });
    return null;
  };

  const removeCoupon = () => setCupom(null);

  const detalhado = useMemo(
    () => itens.map((i) => ({ ...i, produto: getProduto(i.id) })).filter((i) => i.produto),
    [itens]
  );

  const totais = useMemo(() => {
    const subtotal = detalhado.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
    const desconto = cupom?.tipo === 'percentual' ? +(subtotal * (cupom.valor / 100)).toFixed(2) : 0;
    const frete =
      subtotal === 0 || cupom?.tipo === 'frete' || subtotal >= FRETE_GRATIS_A_PARTIR ? 0 : FRETE_PADRAO;
    const total = +(subtotal - desconto + frete).toFixed(2);
    const quantidade = detalhado.reduce((s, i) => s + i.qtd, 0);
    return { subtotal, desconto, frete, total, quantidade };
  }, [detalhado, cupom]);

  return (
    <CartContext.Provider
      value={{ itens: detalhado, cupom, totais, add, setQtd, remove, clear, applyCoupon, removeCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
