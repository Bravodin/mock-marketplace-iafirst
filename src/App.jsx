import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { useLocation, matchRoute, Redirect, Link } from './router.jsx';
import Header from './components/Header.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import { Orders, OrderConfirmation } from './pages/Orders.jsx';

// [caminho, componente, exige login?]
const ROTAS = [
  ['/login', Login],
  ['/cadastro', Register],
  ['/catalogo', Catalog],
  ['/produto/:id', ProductDetail],
  ['/carrinho', Cart],
  ['/checkout', Checkout, true],
  ['/pedido/:numero', OrderConfirmation, true],
  ['/meus-pedidos', Orders, true],
  ['/meu-cadastro', Profile, true],
];

function Routes() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  if (pathname === '/') return <Redirect to="/catalogo" />;

  for (const [rota, Componente, privada] of ROTAS) {
    const params = matchRoute(rota, pathname);
    if (!params) continue;
    if (privada && !user) return <Redirect to={`/login?retorno=${encodeURIComponent(pathname)}`} />;
    return <Componente key={pathname} params={params} />;
  }

  return (
    <div className="page" data-testid="page-404">
      <div className="card vazio">
        <h1>Página não encontrada</h1>
        <Link to="/catalogo" className="btn btn-primary">Ir para o catálogo</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Header />
          <main>
            <Routes />
          </main>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
