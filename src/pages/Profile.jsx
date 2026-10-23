import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import CustomerForm from '../components/CustomerForm.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [msg, setMsg] = useState(null);

  const onSubmit = async (dados) => {
    setMsg(null);
    try {
      const { email, cpf, senha, confirmarSenha, aceiteTermos, ...changes } = dados;
      await updateUser(changes);
      setMsg({ tipo: 'sucesso', texto: 'Dados atualizados com sucesso!' });
    } catch (ex) {
      setMsg({ tipo: 'erro', texto: ex.message });
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="page narrow" data-testid="page-perfil">
      <div className="card">
        <h1>Meu cadastro</h1>
        <CustomerForm modo="perfil" prefix="perfil" inicial={user} onSubmit={onSubmit} textoBotao="Salvar alterações">
          {msg && (
            <div
              className={`alert alert-${msg.tipo}`}
              role="alert"
              data-testid={msg.tipo === 'sucesso' ? 'perfil-success' : 'perfil-error'}
            >
              {msg.texto}
            </div>
          )}
        </CustomerForm>
      </div>
    </div>
  );
}
