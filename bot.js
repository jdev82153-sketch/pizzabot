// Motor do PizzaBot: regras puras em JS, sem DOM e sem rede.
// Roda no navegador (demo) e no Node (futuro backend do WhatsApp).
(function (root) {
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const has = (t, ws) => ws.some(w => new RegExp("\\b" + w + "\\b").test(t));
  const SIZES = { P: ["pequena", "brotinho", "p"], M: ["media", "m"], G: ["grande", "familia", "g"] };
  const NUM = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4 };
  const DEMO = "_(cardápio de demonstração)_";
  const newSession = () => ({ items: [], pending: null });

  const qty = t => { const m = t.match(/\b(\d|um|uma|dois|duas|tres|quatro)\b/); return m ? Math.min(Math.max(NUM[m[1]] || +m[1] || 1, 1), 10) : 1; };
  const prices = (f, cfg) => Object.keys(f.precos).map(k => `${cfg.tamanhos[k]} ${brl(f.precos[k])}`).join(" | ");
  const menuText = cfg => "🍕 *Pizzas*\n" + cfg.sabores.map(f => `• *${f.nome}* – ${f.desc}\n   ${prices(f, cfg)}${f.disponivel ? "" : " (indisponível)"}`).join("\n") +
    "\n\n🥤 *Bebidas*\n" + cfg.bebidas.map(b => `• ${b.nome} – ${brl(b.preco)}`).join("\n") + "\n\n" + DEMO;

  function summary(s, cfg) {
    const sub = s.items.reduce((a, i) => a + i.preco * i.qtd, 0), e = cfg.entrega;
    let m = "🧾 *Resumo do pedido (simulação)*\n" + s.items.map(i => `• ${i.qtd}x ${i.nome} – ${brl(i.preco * i.qtd)}`).join("\n");
    m += `\n\nSubtotal: ${brl(sub)}\nTaxa de entrega: ${brl(e.taxa)}\n*Total com entrega: ${brl(sub + e.taxa)}*`;
    if (sub < e.minimo) m += `\n\n⚠️ Pedido mínimo para entrega: ${brl(e.minimo)}.`;
    return m;
  }

  function respond(input, s, cfg) {
    const t = norm(input), out = { msgs: [], quick: [], handoff: false };
    const say = m => out.msgs.push(m);
    const handoff = m => { say(m + "\nUm atendente humano vai continuar esta conversa."); out.handoff = true; return out; };
    const flavors = cfg.sabores.filter(x => t.includes(norm(x.nome)));
    const size = Object.keys(SIZES).find(k => has(t, SIZES[k]));
    const drink = cfg.bebidas.find(b => t.includes(b.chave));
    const flavorChips = () => cfg.sabores.filter(f => f.disponivel).map(f => f.nome);

    if (has(t, ["atendente", "humano", "pessoa", "reclamacao", "gerente", "falar com"])) return handoff("Claro, vou encaminhar você. 👤");
    if (has(t, ["cancelar", "limpar", "esvaziar", "recomecar"])) { s.items = []; s.pending = null; say("Pedido limpo. Podemos recomeçar quando quiser!"); out.quick = ["Ver cardápio"]; return out; }
    if (has(t, ["finalizar", "fechar", "concluir", "confirmar"])) {
      if (!s.items.length) { say("Seu pedido está vazio. Escolha uma pizza primeiro!"); out.quick = ["Ver cardápio"]; return out; }
      say(summary(s, cfg));
      say("✅ *Simulação concluída.* Nenhum pedido real foi criado, e preços e disponibilidade não foram confirmados. Na versão real, a pizzaria confirma o pedido.");
      return out;
    }
    if (has(t, ["meu pedido", "carrinho", "resumo"])) {
      if (!s.items.length) say("Seu pedido ainda está vazio."); else { say(summary(s, cfg)); out.quick = ["Finalizar pedido", "Adicionar bebida"]; }
      return out;
    }
    if (has(t, ["quanto", "preco", "precos", "valor", "custa", "custam", "tem", "disponivel"])) {
      if (flavors.length) {
        const f = flavors[0];
        say(`*${f.nome}* – ${f.desc}\n${prices(f, cfg)}\n${DEMO}`);
        if (has(t, ["tem", "disponivel"])) say(f.disponivel ? "Consta no cardápio, mas a disponibilidade real de hoje precisa ser confirmada por um atendente." : "No cardápio de demonstração, este sabor está marcado como indisponível.");
        out.quick = ["Quero uma " + f.nome]; return out;
      }
      if (drink) { say(`${drink.nome} – ${brl(drink.preco)}\n${DEMO}`); return out; }
      if (!has(t, ["tem"])) { say(menuText(cfg)); out.quick = ["Fazer um pedido"]; return out; }
    }
    const wantsOrder = has(t, ["quero", "pedir", "pedido", "adicionar", "adiciona", "vou querer", "mande", "manda"]);
    if (flavors.length || drink || (s.pending && size) || wantsOrder) {
      const p = s.pending || {}, f = flavors[0] || p.flavor, sz = size || p.size, q = qty(t);
      if (drink) { s.items.push({ nome: drink.nome, preco: drink.preco, qtd: q }); say(`Adicionei ${q}x ${drink.nome}. 🥤`); }
      if (f) {
        if (!f.disponivel) { s.pending = null; say(`${f.nome} está indisponível no cardápio de demonstração. Escolha outro sabor:`); out.quick = flavorChips(); return out; }
        if (!sz) { s.pending = { flavor: f }; say(`Qual tamanho para a ${f.nome}?`); out.quick = Object.keys(f.precos).map(k => cfg.tamanhos[k]); return out; }
        s.items.push({ nome: `Pizza ${f.nome} (${cfg.tamanhos[sz]})`, preco: f.precos[sz], qtd: q }); s.pending = null;
        say(`Adicionei ${q}x Pizza ${f.nome} (${cfg.tamanhos[sz]}). 🍕`);
      } else if (sz) { s.pending = { size: sz }; say("Qual sabor você quer?"); out.quick = flavorChips(); return out; }
      else if (!drink) { say("Qual sabor você quer? Não encontrei esse item no cardápio."); out.quick = flavorChips(); return out; }
      out.quick = ["Adicionar bebida", "Finalizar pedido", "Ver pedido"]; return out;
    }
    if (has(t, ["cardapio", "sabores", "menu", "opcoes", "pizzas", "bebidas"])) { say(menuText(cfg)); out.quick = ["Fazer um pedido"]; return out; }
    if (has(t, ["horario", "aberto", "abre", "fecha", "funciona", "funcionamento"])) { say(`🕒 ${cfg.horario}.\n${DEMO}`); return out; }
    if (has(t, ["entrega", "entregam", "taxa", "frete", "demora", "tempo", "retirada", "retirar"])) {
      const e = cfg.entrega;
      say(`🛵 Entrega: ${e.areas}.\nTaxa: ${brl(e.taxa)} | Pedido mínimo: ${brl(e.minimo)} | Prazo estimado: ${e.tempo}.${e.retirada ? "\nTambém há retirada no balcão." : ""}\n${DEMO}`); return out;
    }
    if (has(t, ["pagamento", "pagar", "pix", "cartao", "dinheiro"])) { say(`💳 Formas de pagamento: ${cfg.pagamento}.\n${DEMO}`); return out; }
    if (has(t, ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai"])) {
      say(`Olá! Eu sou o *PizzaBot* da ${cfg.nome}. 🍕\nPosso falar do cardápio, preços, horário e entrega, e simular um pedido.`);
      out.quick = ["Ver cardápio", "Fazer um pedido", "Horário", "Entrega"]; return out;
    }
    return handoff("Não tenho essa informação com segurança e prefiro não responder errado.");
  }
  const api = { respond, newSession, norm };
  if (typeof module !== "undefined") module.exports = api; else root.PizzaBot = api;
})(this);
 
