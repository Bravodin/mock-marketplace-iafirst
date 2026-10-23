import { useState } from 'react';
import { Link, navigate, Redirect } from '../router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CustomerForm from '../components/CustomerForm.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const [erro, setErro] = useState('');
  const [concluido, setConcluido] = useState(false);

  if (user && !concluido) return <Redirect to="/catalogo" />;

  const onSubmit = async (dados) => {
    setErro('');
    try {
      await register(dados);
      setConcluido(true);
      toast('Cadastro realizado com sucesso!');
      navigate('/catalogo', { replace: true });
    } catch (ex) {
      setErro(ex.message);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="page narrow" data-testid="page-cadastro">
      <div className="card">
        <h1>Criar conta</h1>
        <p className="muted">
          Já tem cadastro? <Link to="/login" data-testid="cadastro-link-login">Entrar</Link>
        </p>
        <CustomerForm modo="cadastro" prefix="cadastro" onSubmit={onSubmit} textoBotao="Criar conta">
          {erro && (
            <div className="alert alert-erro" role="alert" data-testid="cadastro-error">
              {erro}
            </div>
          )}
        </CustomerForm>
      </div>
    </div>
  );
}
