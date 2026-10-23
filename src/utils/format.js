export const onlyDigits = (v = '') => String(v).replace(/\D/g, '');

export const formatBRL = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function maskCPF(v) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskCEP(v) {
  return onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskCard(v) {
  return onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskExpiry(v) {
  return onlyDigits(v).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
}

export function isValidCPF(v) {
  const cpf = onlyDigits(v);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function ageFrom(dateStr) {
  const b = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(b.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
