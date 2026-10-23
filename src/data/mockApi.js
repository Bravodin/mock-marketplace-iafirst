// "Backend" simulado: tudo em memória + localStorage, com latência configurável.
import { PRODUTOS } from './products.js';
import { load, save, getDelay } from '../utils/storage.js';
import { onlyDigits } from '../utils/format.js';

const sleep = () => new Promise((r) => setTimeout(r, getDelay()));

const SEED_USERS = [
  {
    id: 1,
    nome: 'Maria Silva',
    email: 'cliente@teste.com',
    senha: 'Senha@123',
    cpf: '52998224725',
    telefone: '11987654321',
    dataNascimento: '1990-05-15',
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 101',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    newsletter: true,
    bloqueado: false,
  },
  {
    id: 2,
    nome: 'João Bloqueado',
    email: 'bloqueado@teste.com',
    senha: 'Senha@123',
    cpf: '11144477735',
    telefone: '21912345678',
    dataNascimento: '1985-01-20',
    cep: '20040002',
    logradouro: 'Avenida Rio Branco',
    numero: '50',
    complemento: '',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    newsletter: false,
    bloqueado: true,
  },
];

const CEPS = {
  '01310100': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
  '20040002': { logradouro: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ' },
  '30130010': { logradouro: 'Avenida Afonso Pena', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG' },
  '80010000': { logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', uf: 'PR' },
  '40010000': { logradouro: 'Avenida da França', bairro: 'Comércio', cidade: 'Salvador', uf: 'BA' },
};

export const CUPONS = {
  DESCONTO10: { tipo: 'percentual', valor: 10, descricao: '10% de desconto' },
  FRETEGRATIS: { tipo: 'frete', valor: 0, descricao: 'Frete grátis' },
  EXPIRADO: { expirado: true },
};

const getUsers = () => load('users', SEED_USERS);
const setUsers = (u) => save('users', u);
const publicUser = ({ senha, ...rest }) => rest;

export async function apiLogin(email, senha) {
  await sleep();
  const user = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.senha !== senha) throw new Error('E-mail ou senha inválidos.');
  if (user.bloqueado) throw new Error('Usuário bloqueado. Entre em contato com o suporte.');
  return publicUser(user);
}

export async function apiRegister(data) {
  await sleep();
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase()))
    throw new Error('Este e-mail já está cadastrado.');
  if (users.some((u) => u.cpf === onlyDigits(data.cpf)))
    throw new Error('Este CPF já está cadastrado.');
  const novo = {
    ...data,
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    email: data.email.trim().toLowerCase(),
    cpf: onlyDigits(data.cpf),
    telefone: onlyDigits(data.telefone),
    cep: onlyDigits(data.cep),
    bloqueado: false,
  };
  delete novo.confirmarSenha;
  delete novo.aceiteTermos;
  setUsers([...users, novo]);
  return publicUser(novo);
}

export async function apiUpdateUser(id, changes) {
  await sleep();
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) throw new Error('Usuário não encontrado.');
  users[idx] = {
    ...users[idx],
    ...changes,
    telefone: onlyDigits(changes.telefone ?? users[idx].telefone),
    cep: onlyDigits(changes.cep ?? users[idx].cep),
  };
  setUsers(users);
  return publicUser(users[idx]);
}

export async function apiGetProducts() {
  await sleep();
  return PRODUTOS;
}

export async function apiLookupCEP(cep) {
  await sleep();
  const end = CEPS[onlyDigits(cep)];
  if (!end) throw new Error('CEP não encontrado. Preencha o endereço manualmente.');
  return end;
}

export async function apiPlaceOrder({ userId, itens, totais, pagamento }) {
  await sleep();
  if (pagamento.metodo === 'cartao' && onlyDigits(pagamento.numero).endsWith('0000'))
    throw new Error('Pagamento recusado pela operadora do cartão.');
  const pedido = {
    numero: String(100000 + Math.floor(Math.random() * 900000)),
    data: new Date().toISOString(),
    userId,
    itens,
    totais,
    pagamento: { metodo: pagamento.metodo, parcelas: pagamento.parcelas || 1 },
    status: pagamento.metodo === 'cartao' ? 'Pagamento aprovado' : 'Aguardando pagamento',
  };
  save('orders', [...load('orders', []), pedido]);
  return pedido;
}

export function getOrders(userId) {
  return load('orders', []).filter((o) => o.userId === userId).reverse();
}

export function getOrder(numero) {
  return load('orders', []).find((o) => o.numero === numero);
}
