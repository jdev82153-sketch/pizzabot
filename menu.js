// CARDÁPIO DE DEMONSTRAÇÃO — dados fictícios. Edite à vontade.
// Em produção, estes dados virão do cadastro real da pizzaria.
var PIZZA_CONFIG = {
  demo: true,
  nome: "Pizzaria Demo",
  horario: "Terça a domingo, das 18h às 23h",
  entrega: { taxa: 6, minimo: 30, tempo: "40 a 60 minutos", areas: "Centro e bairros próximos", retirada: true },
  pagamento: "Pix, cartão e dinheiro",
  tamanhos: { P: "Pequena", M: "Média", G: "Grande" },
  sabores: [
    { nome: "Margherita", desc: "molho, mussarela, tomate e manjericão", disponivel: true, precos: { P: 30, M: 42, G: 54 } },
    { nome: "Calabresa", desc: "mussarela, calabresa e cebola", disponivel: true, precos: { P: 32, M: 44, G: 56 } },
    { nome: "Portuguesa", desc: "presunto, ovo, cebola, azeitona e mussarela", disponivel: true, precos: { P: 34, M: 47, G: 60 } },
    { nome: "Quatro Queijos", desc: "mussarela, provolone, parmesão e gorgonzola", disponivel: true, precos: { P: 36, M: 50, G: 64 } },
    { nome: "Frango com Catupiry", desc: "frango desfiado e catupiry", disponivel: false, precos: { P: 35, M: 48, G: 62 } }
  ],
  bebidas: [
    { nome: "Refrigerante 2L", chave: "refri", preco: 12 },
    { nome: "Suco 500ml", chave: "suco", preco: 8 }
  ]
};
if (typeof module !== "undefined") module.exports = PIZZA_CONFIG;
