import { useState } from 'react';
import { Link, navigate, useLocation } from '../router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { totais } = useCart();
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);

  const fechar = () => setAberto(false);
  const ativo = (p) => (pathname.startsWith(p) ? 'ativo' : undefined);

  const sair = () => {
    logout();
    fechar();
    navigate('/login');
  };

  return (
    <header className="header" data-testid="header">
      <div className="header-inner">
        <Link to="/catalogo" className="logo" data-testid="header-logo" onClick={fechar}>
          🛍️ Loja<span>Mock</span>
        </Link>

        <Link to="/carrinho" className="cart-link" data-testid="header-cart" aria-label="Carrinho" onClick={fechar}>
          🛒
          <span className="badge" data-testid="header-cart-count">{totais.quantidade}</span>
        </Link>

        <button
          className="menu-toggle"
          data-testid="menu-toggle"
          aria-label="Abrir menu"
          aria-expanded={aberto}
          onClick={() => setAberto((a) => !a)}
        >
          ☰
        </button>

        <nav className={`nav ${aberto ? 'aberto' : ''}`} data-testid="nav">
          <Link to="/catalogo" className={ativo('/catalogo')} data-testid="nav-catalogo" onClick={fechar}>
            Catálogo
          </Link>
          {user ? (
            <>
              <Link to="/meus-pedidos" className={ativo('/meus-pedidos')} data-testid="nav-pedidos" onClick={fechar}>
                Meus pedidos
              </Link>
              <Link to="/meu-cadastro" className={ativo('/meu-cadastro')} data-testid="nav-cadastro" onClick={fechar}>
                Meu cadastro
              </Link>
              <span className="saudacao" data-testid="header-user-name">
                Olá, {user.nome.split(' ')[0]}
              </span>
              <button className="btn btn-link" data-testid="nav-logout" onClick={sair}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={ativo('/login')} data-testid="nav-login" onClick={fechar}>
                Entrar
              </Link>
              <Link to="/cadastro" className={ativo('/cadastro')} data-testid="nav-register" onClick={fechar}>
                Cadastre-se
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
