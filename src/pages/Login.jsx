import { useState } from 'react';
import { Link, navigate, useLocation, Redirect } from '../router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import { isValidEmail } from '../utils/format.js';

export default function Login() {
  const { user, login } = useAuth();
  const { query } = useLocation();
  const retorno = query.get('retorno') || '/catalogo';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (user && !enviando) return <Redirect to={retorno} />;

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!email.trim()) err.email = 'Informe o e-mail.';
    else if (!isValidEmail(email)) err.email = 'E-mail inválido.';
    if (!senha) err.senha = 'Informe a senha.';
    setErros(err);
    setErroGeral('');
    if (Object.keys(err).length) return;

    setEnviando(true);
    try {
      await login(email, senha);
      navigate(retorno, { replace: true });
    } catch (ex) {
      setErroGeral(ex.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page" data-testid="page-login">
      <form className="card auth-card" onSubmit={submit} noValidate data-testid="login-form">
        <h1>Entrar</h1>
        <p className="muted">Acesse sua conta para finalizar compras.</p>

        {query.get('retorno') && (
          <div className="alert alert-info" data-testid="login-required-message">
            Faça login para continuar.
          </div>
        )}
        {erroGeral && (
          <div className="alert alert-erro" role="alert" data-testid="login-error">
            {erroGeral}
          </div>
        )}

        <Field id="login-email" label="E-mail" error={erros.email}>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="login-senha" label="Senha" error={erros.senha}>
          <div className="input-group">
            <input
              id="login-senha"
              name="senha"
              type={mostrar ? 'text' : 'password'}
              autoComplete="current-password"
              data-testid="login-senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="login-toggle-senha"
              onClick={() => setMostrar((m) => !m)}
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </Field>

        <button className="btn btn-primary btn-block" type="submit" disabled={enviando} data-testid="login-submit">
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="center muted">
          Não tem conta?{' '}
          <Link to="/cadastro" data-testid="login-link-cadastro">
            Cadastre-se
          </Link>
        </p>

        <details className="dica">
          <summary>Usuários de teste</summary>
          <ul>
            <li><code>cliente@teste.com</code> / <code>Senha@123</code> — ativo</li>
            <li><code>bloqueado@teste.com</code> / <code>Senha@123</code> — bloqueado</li>
          </ul>
        </details>
      </form>
    </div>
  );
}
