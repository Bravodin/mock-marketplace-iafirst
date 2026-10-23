export const CATEGORIAS = ['Eletrônicos', 'Livros', 'Casa', 'Esportes'];

export const PRODUTOS = [
  { id: 1, nome: 'Fone de Ouvido Bluetooth', categoria: 'Eletrônicos', preco: 249.9, estoque: 15, cor: '#4f46e5', descricao: 'Fone sem fio com cancelamento de ruído e bateria de até 30 horas.' },
  { id: 2, nome: 'Smartwatch Fit Pro', categoria: 'Eletrônicos', preco: 599.0, estoque: 8, cor: '#0891b2', descricao: 'Relógio inteligente com GPS, monitor cardíaco e resistência à água.' },
  { id: 3, nome: 'Teclado Mecânico RGB', categoria: 'Eletrônicos', preco: 389.9, estoque: 5, cor: '#7c3aed', descricao: 'Teclado mecânico com switches azuis e iluminação RGB configurável.' },
  { id: 4, nome: 'Mouse Gamer 16000 DPI', categoria: 'Eletrônicos', preco: 159.9, estoque: 0, cor: '#dc2626', descricao: 'Mouse com sensor óptico de alta precisão e 8 botões programáveis.' },
  { id: 5, nome: 'Clean Code', categoria: 'Livros', preco: 89.9, estoque: 20, cor: '#059669', descricao: 'Boas práticas para escrever código limpo e de fácil manutenção.' },
  { id: 6, nome: 'Domain-Driven Design', categoria: 'Livros', preco: 129.0, estoque: 12, cor: '#16a34a', descricao: 'Atacando as complexidades no coração do software.' },
  { id: 7, nome: 'O Programador Pragmático', categoria: 'Livros', preco: 99.5, estoque: 3, cor: '#65a30d', descricao: 'De aprendiz a mestre: dicas práticas para desenvolvedores.' },
  { id: 8, nome: 'Cafeteira Elétrica Inox', categoria: 'Casa', preco: 219.9, estoque: 10, cor: '#b45309', descricao: 'Cafeteira programável com jarra térmica para 30 xícaras.' },
  { id: 9, nome: 'Jogo de Panelas 5 Peças', categoria: 'Casa', preco: 349.0, estoque: 6, cor: '#ea580c', descricao: 'Panelas antiaderentes com tampas de vidro temperado.' },
  { id: 10, nome: 'Luminária de Mesa LED', categoria: 'Casa', preco: 79.9, estoque: 25, cor: '#ca8a04', descricao: 'Luminária articulada com 3 temperaturas de cor e porta USB.' },
  { id: 11, nome: 'Tênis de Corrida Air', categoria: 'Esportes', preco: 459.9, estoque: 9, cor: '#db2777', descricao: 'Tênis leve com amortecimento responsivo para treinos longos.' },
  { id: 12, nome: 'Garrafa Térmica 1L', categoria: 'Esportes', preco: 69.9, estoque: 40, cor: '#0284c7', descricao: 'Mantém bebidas geladas por 24h e quentes por 12h.' },
];

export const getProduto = (id) => PRODUTOS.find((p) => p.id === Number(id));
