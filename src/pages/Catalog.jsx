import { useEffect, useMemo, useState } from 'react';
import { Link } from '../router.jsx';
import { apiGetProducts } from '../data/mockApi.js';
import { CATEGORIAS } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { Spinner } from '../components/Field.jsx';
import { formatBRL } from '../utils/format.js';

const ORDENACOES = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'nome-az': 'Nome (A-Z)',
};

export default function Catalog() {
  const [produtos, setProdutos] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ordem, setOrdem] = useState('relevancia');
  const { add } = useCart();
  const toast = useToast();

  useEffect(() => {
    let vivo = true;
    apiGetProducts().then((p) => vivo && setProdutos(p));
    return () => { vivo = false; };
  }, []);

  const lista = useMemo(() => {
    if (!produtos) return [];
    const termo = busca.trim().toLowerCase();
    let r = produtos.filter(
      (p) => (!categoria || p.categoria === categoria) && (!termo || p.nome.toLowerCase().includes(termo))
    );
    if (ordem === 'menor-preco') r = [...r].sort((a, b) => a.preco - b.preco);
    if (ordem === 'maior-preco') r = [...r].sort((a, b) => b.preco - a.preco);
    if (ordem === 'nome-az') r = [...r].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return r;
  }, [produtos, busca, categoria, ordem]);

  const adicionar = (p) => {
    const ok = add(p.id, 1);
    toast(ok ? `${p.nome} adicionado ao carrinho.` : `Estoque máximo de ${p.nome} atingido.`, ok ? 'sucesso' : 'erro');
  };

  const limpar = () => {
    setBusca('');
    setCategoria('');
    setOrdem('relevancia');
  };

  return (
    <div className="page" data-testid="page-catalogo">
      <h1>Catálogo</h1>

      <div className="filtros card">
        <input
          type="search"
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          data-testid="catalog-search"
          id="catalog-search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          aria-label="Categoria"
          data-testid="catalog-category"
          id="catalog-category"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Ordenar por"
          data-testid="catalog-sort"
          id="catalog-sort"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
        >
          {Object.entries(ORDENACOES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {!produtos ? (
        <Spinner testId="catalog-loading" texto="Carregando produtos..." />
      ) : (
        <>
          <p className="muted" data-testid="catalog-count">
            {lista.length} {lista.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>

          {lista.length === 0 ? (
            <div className="vazio card" data-testid="catalog-empty">
              <p>Nenhum produto encontrado.</p>
              <button className="btn" onClick={limpar} data-testid="catalog-clear-filters">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid-produtos" data-testid="catalog-list">
              {lista.map((p) => (
                <article
                  key={p.id}
                  className="card produto"
                  data-testid={`product-card-${p.id}`}
                  data-product-id={p.id}
                >
                  <Link to={`/produto/${p.id}`} data-testid={`product-link-${p.id}`}>
                    <ProductImage produto={p} />
                  </Link>
                  <div className="produto-body">
                    <span className="tag" data-testid={`product-category-${p.id}`}>{p.categoria}</span>
                    <h2>
                      <Link to={`/produto/${p.id}`} data-testid={`product-name-${p.id}`}>{p.nome}</Link>
                    </h2>
                    <div className="preco" data-testid={`product-price-${p.id}`}>{formatBRL(p.preco)}</div>
                    {p.estoque === 0 ? (
                      <button className="btn btn-block" disabled data-testid={`product-add-${p.id}`}>
                        Esgotado
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-block"
                        data-testid={`product-add-${p.id}`}
                        onClick={() => adicionar(p)}
                      >
                        Adicionar ao carrinho
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
