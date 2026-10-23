import { useState } from 'react';
import Field from './Field.jsx';
import { apiLookupCEP } from '../data/mockApi.js';
import {
  maskCPF, maskPhone, maskCEP, onlyDigits, isValidCPF, isValidEmail, ageFrom,
} from '../utils/format.js';

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const VAZIO = {
  nome: '', email: '', cpf: '', telefone: '', dataNascimento: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  senha: '', confirmarSenha: '', newsletter: false, aceiteTermos: false,
};

function validar(v, modo) {
  const e = {};
  if (!v.nome.trim()) e.nome = 'Informe o nome completo.';
  else if (v.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.';

  if (modo === 'cadastro') {
    if (!v.email.trim()) e.email = 'Informe o e-mail.';
    else if (!isValidEmail(v.email)) e.email = 'E-mail inválido.';
    if (!v.cpf) e.cpf = 'Informe o CPF.';
    else if (!isValidCPF(v.cpf)) e.cpf = 'CPF inválido.';
  }

  const tel = onlyDigits(v.telefone);
  if (!tel) e.telefone = 'Informe o telefone.';
  else if (tel.length < 10) e.telefone = 'Telefone inválido.';

  if (!v.dataNascimento) e.dataNascimento = 'Informe a data de nascimento.';
  else {
    const idade = ageFrom(v.dataNascimento);
    if (idade < 0 || idade > 120) e.dataNascimento = 'Data inválida.';
    else if (idade < 18) e.dataNascimento = 'É necessário ter 18 anos ou mais.';
  }

  if (onlyDigits(v.cep).length !== 8) e.cep = 'CEP inválido.';
  if (!v.logradouro.trim()) e.logradouro = 'Informe o endereço.';
  if (!v.numero.trim()) e.numero = 'Informe o número.';
  if (!v.bairro.trim()) e.bairro = 'Informe o bairro.';
  if (!v.cidade.trim()) e.cidade = 'Informe a cidade.';
  if (!v.uf) e.uf = 'Selecione o estado.';

  if (modo === 'cadastro') {
    if (!v.senha) e.senha = 'Informe a senha.';
    else if (v.senha.length < 8 || !/[A-Za-z]/.test(v.senha) || !/\d/.test(v.senha))
      e.senha = 'A senha deve ter ao menos 8 caracteres, com letras e números.';
    if (!v.confirmarSenha) e.confirmarSenha = 'Confirme a senha.';
    else if (v.confirmarSenha !== v.senha) e.confirmarSenha = 'As senhas não conferem.';
    if (!v.aceiteTermos) e.aceiteTermos = 'Você precisa aceitar os termos de uso.';
  }
  return e;
}

/**
 * Formulário de cliente reutilizado no cadastro e no "Meu cadastro".
 * modo: 'cadastro' | 'perfil'. prefix define ids/data-testid (ex.: cadastro-nome).
 */
export default function CustomerForm({ modo, prefix, inicial, onSubmit, textoBotao, children }) {
  const [v, setV] = useState(() => ({
    ...VAZIO,
    ...inicial,
    cpf: maskCPF(inicial?.cpf || ''),
    telefone: maskPhone(inicial?.telefone || ''),
    cep: maskCEP(inicial?.cep || ''),
  }));
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const id = (campo) => `${prefix}-${campo}`;
  const set = (campo, valor) => {
    setV((s) => ({ ...s, [campo]: valor }));
    if (erros[campo]) setErros((s) => ({ ...s, [campo]: undefined }));
  };

  const onCep = async (valor) => {
    const masked = maskCEP(valor);
    set('cep', masked);
    if (onlyDigits(masked).length !== 8) return;
    setBuscandoCep(true);
    try {
      const end = await apiLookupCEP(masked);
      setV((s) => ({ ...s, ...end }));
      setErros((s) => ({ ...s, cep: undefined, logradouro: undefined, bairro: undefined, cidade: undefined, uf: undefined }));
    } catch (ex) {
      setErros((s) => ({ ...s, cep: ex.message }));
    } finally {
      setBuscandoCep(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validar(v, modo);
    setErros(err);
    if (Object.keys(err).length) {
      document.getElementById(id(Object.keys(err)[0]))?.focus();
      return;
    }
    setEnviando(true);
    try {
      await onSubmit(v);
    } finally {
      setEnviando(false);
    }
  };

  const input = (campo, props = {}) => (
    <input
      id={id(campo)}
      name={campo}
      data-testid={id(campo)}
      value={v[campo]}
      onChange={(e) => set(campo, e.target.value)}
      {...props}
    />
  );

  return (
    <form onSubmit={submit} noValidate data-testid={`${prefix}-form`}>
      {children}

      <fieldset>
        <legend>Dados pessoais</legend>
        <div className="grid-2">
          <Field id={id('nome')} label="Nome completo *" error={erros.nome} className="span-2">
            {input('nome', { autoComplete: 'name' })}
          </Field>
          <Field id={id('email')} label="E-mail *" error={erros.email}>
            {input('email', { type: 'email', autoComplete: 'email', disabled: modo === 'perfil' })}
          </Field>
          <Field id={id('cpf')} label="CPF *" error={erros.cpf} hint="Somente números ou 000.000.000-00">
            {input('cpf', {
              inputMode: 'numeric',
              disabled: modo === 'perfil',
              onChange: (e) => set('cpf', maskCPF(e.target.value)),
            })}
          </Field>
          <Field id={id('telefone')} label="Celular *" error={erros.telefone}>
            {input('telefone', {
              inputMode: 'tel',
              autoComplete: 'tel',
              onChange: (e) => set('telefone', maskPhone(e.target.value)),
            })}
          </Field>
          <Field id={id('dataNascimento')} label="Data de nascimento *" error={erros.dataNascimento}>
            {input('dataNascimento', { type: 'date' })}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Endereço</legend>
        <div className="grid-2">
          <Field
            id={id('cep')}
            label="CEP *"
            error={erros.cep}
            hint={buscandoCep ? undefined : 'Ex.: 01310-100, 20040-002, 30130-010'}
          >
            {input('cep', { inputMode: 'numeric', onChange: (e) => onCep(e.target.value) })}
            {buscandoCep && (
              <small className="hint" data-testid={id('cep-loading')}>Buscando CEP...</small>
            )}
          </Field>
          <Field id={id('logradouro')} label="Endereço *" error={erros.logradouro}>
            {input('logradouro')}
          </Field>
          <Field id={id('numero')} label="Número *" error={erros.numero}>
            {input('numero')}
          </Field>
          <Field id={id('complemento')} label="Complemento" error={erros.complemento}>
            {input('complemento')}
          </Field>
          <Field id={id('bairro')} label="Bairro *" error={erros.bairro}>
            {input('bairro')}
          </Field>
          <Field id={id('cidade')} label="Cidade *" error={erros.cidade}>
            {input('cidade')}
          </Field>
          <Field id={id('uf')} label="Estado *" error={erros.uf}>
            <select
              id={id('uf')}
              name="uf"
              data-testid={id('uf')}
              value={v.uf}
              onChange={(e) => set('uf', e.target.value)}
            >
              <option value="">Selecione...</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      {modo === 'cadastro' && (
        <fieldset>
          <legend>Acesso</legend>
          <div className="grid-2">
            <Field id={id('senha')} label="Senha *" error={erros.senha} hint="Mínimo 8 caracteres, com letras e números">
              {input('senha', { type: 'password', autoComplete: 'new-password' })}
            </Field>
            <Field id={id('confirmarSenha')} label="Confirmar senha *" error={erros.confirmarSenha}>
              {input('confirmarSenha', { type: 'password', autoComplete: 'new-password' })}
            </Field>
          </div>
        </fieldset>
      )}

      <div className="checks">
        <label className="check">
          <input
            type="checkbox"
            id={id('newsletter')}
            data-testid={id('newsletter')}
            checked={v.newsletter}
            onChange={(e) => set('newsletter', e.target.checked)}
          />
          Quero receber ofertas por e-mail
        </label>
        {modo === 'cadastro' && (
          <>
            <label className="check">
              <input
                type="checkbox"
                id={id('aceiteTermos')}
                data-testid={id('aceiteTermos')}
                checked={v.aceiteTermos}
                onChange={(e) => set('aceiteTermos', e.target.checked)}
              />
              Li e aceito os termos de uso *
            </label>
            {erros.aceiteTermos && (
              <small className="error-text" role="alert" data-testid={`${id('aceiteTermos')}-error`}>
                {erros.aceiteTermos}
              </small>
            )}
          </>
        )}
      </div>

      <button className="btn btn-primary btn-block" type="submit" disabled={enviando} data-testid={id('submit')}>
        {enviando ? 'Salvando...' : textoBotao}
      </button>
    </form>
  );
}
