const $ = s => document.querySelector(s);
const chat = $("#chat"), quick = $("#quick"), typing = $("#typing"), input = $("#input");
let session = PizzaBot.newSession();
const fmt = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*(.+?)\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>").replace(/\n/g, "<br>");
const clock = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const wait = ms => new Promise(r => setTimeout(r, ms));
function add(cls, html) { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; chat.insertBefore(d, typing); chat.scrollTop = chat.scrollHeight; }
async function send(text) {
  text = text.trim(); if (!text) return;
  quick.innerHTML = ""; add("msg out", fmt(text) + `<span class="time">${clock()}</span>`);
  const r = PizzaBot.respond(text, session, PIZZA_CONFIG);
  for (const m of r.msgs) { typing.hidden = false; chat.scrollTop = chat.scrollHeight; await wait(450); typing.hidden = true; add("msg in", fmt(m) + `<span class="time">${clock()}</span>`); }
  if (r.handoff) add("notice", "👤 Encaminhado ao atendimento humano (simulado nesta demonstração)");
  r.quick.forEach(q => { const b = document.createElement("button"); b.textContent = q; b.onclick = () => send(q); quick.append(b); });
}
$("#form").onsubmit = e => { e.preventDefault(); const v = input.value; input.value = ""; send(v); };
$("#reset").onclick = () => { session = PizzaBot.newSession(); chat.querySelectorAll(".msg,.notice").forEach(n => n.remove()); quick.innerHTML = ""; send("oi"); };
send("oi");
