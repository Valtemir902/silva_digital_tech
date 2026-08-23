"use strict";

const STORE_KEY = "microcrm.recibos.orcamentos.v1";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const state = loadState();
const $ = (id) => document.getElementById(id);
let financePeriod = "all";

const fields = {
  clientId: $("clientId"),
  clientName: $("clientName"),
  clientPhone: $("clientPhone"),
  clientEmail: $("clientEmail"),
  clientTaxId: $("clientTaxId"),
  clientAddress: $("clientAddress"),
  clientNotes: $("clientNotes"),
  docId: $("docId"),
  docType: $("docType"),
  docStatus: $("docStatus"),
  docClient: $("docClient"),
  docDate: $("docDate"),
  docDescription: $("docDescription"),
  docDiscount: $("docDiscount"),
  docDue: $("docDue"),
  bizName: $("bizName"),
  bizTaxId: $("bizTaxId"),
  bizPhone: $("bizPhone"),
  bizEmail: $("bizEmail"),
  bizAddress: $("bizAddress"),
  bizMessage: $("bizMessage")
};

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindForms();
  bindFinanceControls();
  fillSettings();
  clearDocForm();
  renderAll();
});

function defaultState() {
  return {
    clients: [],
    docs: [],
    settings: {
      bizName: "Minha Empresa",
      bizTaxId: "",
      bizPhone: "",
      bizEmail: "",
      bizAddress: "",
      bizMessage: "Obrigado pela preferencia."
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      settings: { ...defaultState().settings, ...(parsed.settings || {}) }
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function text(value) {
  return String(value || "").trim();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
      if (button.dataset.view === "documents") clearDocForm();
    });
  });
  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.viewJump);
      if (button.dataset.viewJump === "documents") {
        clearDocForm(button.dataset.newDocType);
      }
    });
  });
  $("newDocShortcut").addEventListener("click", () => {
    showView("documents");
    clearDocForm();
  });
}

function showView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-button").forEach((button) => {
    const active = button.dataset.view === viewId;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const titles = {
    dashboard: "Painel",
    finance: "Financeiro",
    clients: "Clientes",
    documents: "Recibos e orcamentos",
    settings: "Empresa"
  };
  $("pageTitle").textContent = titles[viewId] || "Painel";
  if (viewId === "finance") requestAnimationFrame(renderFinanceDashboard);
}

function bindForms() {
  $("clientForm").addEventListener("submit", saveClient);
  $("clearClientForm").addEventListener("click", clearClientForm);
  $("deleteClient").addEventListener("click", deleteClient);
  $("clientSearch").addEventListener("input", renderClients);

  $("docForm").addEventListener("submit", saveDoc);
  $("clearDocForm").addEventListener("click", clearDocForm);
  $("deleteDoc").addEventListener("click", deleteDoc);
  $("docSearch").addEventListener("input", renderDocs);
  $("addItem").addEventListener("click", () => addItemRow());
  $("itemsList").addEventListener("input", updateDocTotal);
  $("itemsList").addEventListener("click", (event) => {
    if (event.target.matches("[data-remove-item]")) {
      event.target.closest(".item-row").remove();
      updateDocTotal();
    }
  });
  fields.docDiscount.addEventListener("input", updateDocTotal);
  $("printDoc").addEventListener("click", printCurrentDocument);
  $("downloadShareDoc").addEventListener("click", downloadAndShareCurrentDocument);

  $("settingsForm").addEventListener("submit", saveSettings);
}

function saveClient(event) {
  event.preventDefault();
  const client = {
    id: fields.clientId.value || uid("cli"),
    name: text(fields.clientName.value),
    phone: text(fields.clientPhone.value),
    email: text(fields.clientEmail.value),
    taxId: text(fields.clientTaxId.value),
    address: text(fields.clientAddress.value),
    notes: text(fields.clientNotes.value)
  };
  if (!client.name) return toast("Informe o nome do cliente.");
  const index = state.clients.findIndex((item) => item.id === client.id);
  if (index >= 0) state.clients[index] = client;
  else state.clients.unshift(client);
  saveState();
  clearClientForm();
  renderAll();
  toast("Cliente salvo.");
}

function editClient(id) {
  const client = state.clients.find((item) => item.id === id);
  if (!client) return;
  fields.clientId.value = client.id;
  fields.clientName.value = client.name;
  fields.clientPhone.value = client.phone;
  fields.clientEmail.value = client.email;
  fields.clientTaxId.value = client.taxId;
  fields.clientAddress.value = client.address;
  fields.clientNotes.value = client.notes;
}

function clearClientForm() {
  $("clientForm").reset();
  fields.clientId.value = "";
}

function deleteClient() {
  const id = fields.clientId.value;
  if (!id) return toast("Selecione um cliente para excluir.");
  const used = state.docs.some((doc) => doc.clientId === id);
  if (used) return toast("Cliente usado em documento nao pode ser excluido.");
  state.clients = state.clients.filter((item) => item.id !== id);
  saveState();
  clearClientForm();
  renderAll();
  toast("Cliente excluido.");
}

function saveDoc(event) {
  event.preventDefault();
  const items = readItemRows();
  if (!fields.docClient.value) return toast("Cadastre ou selecione um cliente.");
  if (!items.length) return toast("Adicione pelo menos um item.");
  const doc = {
    id: fields.docId.value || uid("doc"),
    type: fields.docType.value,
    status: fields.docStatus.value,
    clientId: fields.docClient.value,
    date: fields.docDate.value,
    description: text(fields.docDescription.value),
    discount: number(fields.docDiscount.value),
    due: text(fields.docDue.value),
    items
  };
  const index = state.docs.findIndex((item) => item.id === doc.id);
  if (index >= 0) state.docs[index] = doc;
  else state.docs.unshift(doc);
  saveState();
  renderAll();
  fields.docId.value = doc.id;
  toast("Documento salvo.");
}

function editDoc(id) {
  const doc = state.docs.find((item) => item.id === id);
  if (!doc) return;
  fields.docId.value = doc.id;
  fields.docType.value = doc.type;
  fields.docStatus.value = doc.status;
  fields.docClient.value = doc.clientId;
  fields.docDate.value = doc.date;
  fields.docDescription.value = doc.description;
  fields.docDiscount.value = doc.discount;
  fields.docDue.value = doc.due;
  $("itemsList").replaceChildren();
  doc.items.forEach((item) => addItemRow(item));
  updateDocTotal();
}

function clearDocForm(type = "orcamento") {
  $("docForm").reset();
  fields.docId.value = "";
  fields.docType.value = type;
  fields.docStatus.value = "aberto";
  fields.docClient.value = "";
  fields.docDescription.value = "";
  fields.docDate.value = new Date().toISOString().slice(0, 10);
  fields.docDiscount.value = "0";
  fields.docDue.value = "";
  $("itemsList").replaceChildren();
  addItemRow();
  renderClientOptions();
  fields.docClient.value = "";
  updateDocTotal();
}

function deleteDoc() {
  const id = fields.docId.value;
  if (!id) return toast("Selecione um documento para excluir.");
  state.docs = state.docs.filter((item) => item.id !== id);
  saveState();
  clearDocForm();
  renderAll();
  toast("Documento excluido.");
}

function addItemRow(item = {}) {
  const row = document.createElement("div");
  row.className = "item-row";

  row.append(
    labeledInput("Servico", "text", "description", item.description || "", "Ex.: Instalacao"),
    labeledInput("Qtd.", "number", "qty", item.qty || 1, ""),
    labeledInput("Valor", "number", "price", item.price || 0, ""),
    removeButton()
  );

  $("itemsList").append(row);
  updateDocTotal();
}

function labeledInput(labelText, type, key, value, placeholder) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.dataset.item = key;
  input.value = value;
  input.placeholder = placeholder;
  if (type === "number") {
    input.min = "0";
    input.step = "0.01";
  } else {
    input.maxLength = 90;
  }
  label.append(input);
  return label;
}

function removeButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button";
  button.dataset.removeItem = "true";
  button.title = "Remover item";
  button.textContent = "×";
  return button;
}

function readItemRows() {
  return [...document.querySelectorAll(".item-row")]
    .map((row) => ({
      description: text(row.querySelector('[data-item="description"]').value),
      qty: number(row.querySelector('[data-item="qty"]').value),
      price: number(row.querySelector('[data-item="price"]').value)
    }))
    .filter((item) => item.description && item.qty > 0);
}

function docTotal(doc) {
  const subtotal = (doc.items || []).reduce((sum, item) => sum + number(item.qty) * number(item.price), 0);
  return Math.max(0, subtotal - number(doc.discount));
}

function updateDocTotal() {
  const fakeDoc = { items: readItemRows(), discount: number(fields.docDiscount.value) };
  $("docTotal").textContent = currency.format(docTotal(fakeDoc));
}

function saveSettings(event) {
  event.preventDefault();
  state.settings = {
    bizName: text(fields.bizName.value),
    bizTaxId: text(fields.bizTaxId.value),
    bizPhone: text(fields.bizPhone.value),
    bizEmail: text(fields.bizEmail.value),
    bizAddress: text(fields.bizAddress.value),
    bizMessage: text(fields.bizMessage.value)
  };
  saveState();
  toast("Dados da empresa salvos.");
}

function fillSettings() {
  Object.entries(state.settings).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });
}

function renderAll() {
  renderMetrics();
  renderFinanceDashboard();
  renderClientOptions();
  renderClients();
  renderDocs();
  renderRecentDocs();
}

function renderMetrics() {
  $("metricClients").textContent = state.clients.length;
  $("metricDocs").textContent = state.docs.length;
  const open = state.docs.filter((doc) => ["aberto", "aprovado"].includes(doc.status)).reduce((sum, doc) => sum + docTotal(doc), 0);
  const paid = state.docs.filter((doc) => doc.status === "pago").reduce((sum, doc) => sum + docTotal(doc), 0);
  $("metricOpen").textContent = currency.format(open);
  $("metricPaid").textContent = currency.format(paid);
}

function bindFinanceControls() {
  document.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      financePeriod = button.dataset.period;
      document.querySelectorAll("[data-period]").forEach((item) => item.classList.toggle("active", item === button));
      renderFinanceDashboard();
    });
  });
}

function renderFinanceDashboard() {
  if (!$("financePaid")) return;
  const stats = getFinanceStats();
  $("financeHeadline").textContent = currency.format(stats.paid);
  $("financeSubtitle").textContent = `${stats.periodLabel} · ${stats.docs.length} documento(s) analisado(s)`;
  $("financeScore").textContent = `${Math.round(stats.conversion)}%`;
  $("financePaid").textContent = currency.format(stats.paid);
  $("financeReceivable").textContent = currency.format(stats.receivable);
  $("financeAverage").textContent = currency.format(stats.average);
  $("financeActiveDocs").textContent = stats.activeDocs;
  $("financeTrend").textContent = stats.trendLabel;
  renderTopClients(stats);
  renderInsights(stats);
  animateChart((progress) => drawRevenueChart(stats, progress), "revenueChart");
  animateChart((progress) => drawStatusChart(stats, progress), "statusChart");
}

function getFinanceStats() {
  const now = new Date();
  const periodDays = financePeriod === "all" ? null : Number(financePeriod);
  const docs = state.docs.filter((doc) => {
    if (!periodDays || !doc.date) return true;
    const docDate = new Date(`${doc.date}T00:00:00`);
    const diff = (now - docDate) / 86400000;
    return diff <= periodDays;
  });
  const paidDocs = docs.filter((doc) => doc.status === "pago");
  const receivableDocs = docs.filter((doc) => ["aberto", "aprovado"].includes(doc.status));
  const paid = paidDocs.reduce((sum, doc) => sum + docTotal(doc), 0);
  const receivable = receivableDocs.reduce((sum, doc) => sum + docTotal(doc), 0);
  const activeDocs = docs.filter((doc) => doc.status !== "cancelado").length;
  const activeValue = docs.filter((doc) => doc.status !== "cancelado").reduce((sum, doc) => sum + docTotal(doc), 0);
  const average = activeDocs ? activeValue / activeDocs : 0;
  const conversion = activeValue ? (paid / activeValue) * 100 : 0;
  const monthly = buildMonthlySeries(docs);
  const topClients = buildTopClients(docs);
  const statusTotals = ["pago", "aprovado", "aberto", "cancelado"].map((status) => ({
    status,
    label: labelStatus(status),
    value: docs.filter((doc) => doc.status === status).reduce((sum, doc) => sum + docTotal(doc), 0),
    count: docs.filter((doc) => doc.status === status).length
  }));
  const last = monthly[monthly.length - 1]?.paid || 0;
  const previous = monthly[monthly.length - 2]?.paid || 0;
  const trendLabel = last > previous ? "Em alta" : last < previous ? "Em queda" : "Estavel";
  const periodLabel = financePeriod === "all" ? "Todo o historico" : `Ultimos ${financePeriod} dias`;
  return { docs, paid, receivable, activeDocs, average, conversion, monthly, topClients, statusTotals, trendLabel, periodLabel };
}

function buildMonthlySeries(docs) {
  const months = [];
  const base = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      paid: 0,
      receivable: 0
    });
  }
  docs.forEach((doc) => {
    const key = (doc.date || "").slice(0, 7);
    const month = months.find((item) => item.key === key);
    if (!month) return;
    if (doc.status === "pago") month.paid += docTotal(doc);
    if (["aberto", "aprovado"].includes(doc.status)) month.receivable += docTotal(doc);
  });
  return months;
}

function buildTopClients(docs) {
  const totals = new Map();
  docs.filter((doc) => doc.status !== "cancelado").forEach((doc) => {
    const client = getClient(doc.clientId);
    const name = client?.name || "Cliente removido";
    totals.set(name, (totals.get(name) || 0) + docTotal(doc));
  });
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function renderTopClients(stats) {
  const list = $("topClientsList");
  list.replaceChildren();
  const max = Math.max(...stats.topClients.map((item) => item.value), 1);
  stats.topClients.forEach((item) => {
    const row = document.createElement("div");
    row.className = "rank-item";
    const head = document.createElement("div");
    head.className = "rank-row";
    head.append(line("strong", item.name), line("span", currency.format(item.value)));
    const bar = document.createElement("div");
    bar.className = "rank-bar";
    const fill = document.createElement("span");
    fill.style.setProperty("--value", `${Math.max(6, (item.value / max) * 100)}%`);
    bar.append(fill);
    row.append(head, bar);
    list.append(row);
  });
  if (!list.children.length) list.append(emptyMessage("Sem clientes faturados neste periodo."));
}

function renderInsights(stats) {
  const insights = $("financeInsights");
  insights.replaceChildren();
  const messages = [
    {
      title: stats.receivable > stats.paid ? "Prioridade: cobranca ativa" : "Receita confirmada saudavel",
      text: stats.receivable > stats.paid
        ? `Ha ${currency.format(stats.receivable)} em aberto ou aprovado aguardando conversao.`
        : `A receita paga supera a carteira em aberto neste periodo.`
    },
    {
      title: "Ticket medio",
      text: `Cada documento ativo vale em media ${currency.format(stats.average)}.`
    },
    {
      title: "Tendencia",
      text: stats.trendLabel === "Em alta"
        ? "O ultimo mes analisado ficou acima do mes anterior."
        : stats.trendLabel === "Em queda"
          ? "O ultimo mes analisado ficou abaixo do mes anterior; revise propostas abertas."
          : "A receita esta estavel entre os meses recentes."
    }
  ];
  messages.forEach((message) => {
    const item = document.createElement("div");
    item.className = "insight-item";
    item.append(line("strong", message.title), line("span", message.text));
    insights.append(item);
  });
}

function animateChart(draw, canvasId) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const start = performance.now();
  const duration = 700;
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    draw(eased);
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || canvas.width));
  const height = Math.max(220, Math.floor(rect.height || canvas.height));
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function drawRevenueChart(stats, progress) {
  const canvas = $("revenueChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 52, right: 24, top: 24, bottom: 42 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const max = Math.max(...stats.monthly.map((item) => item.paid + item.receivable), 1);
  ctx.strokeStyle = "#dfe5df";
  ctx.lineWidth = 1;
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillStyle = "#66736c";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }
  const gap = 18;
  const barWidth = Math.max(18, (chartWidth - gap * (stats.monthly.length - 1)) / stats.monthly.length);
  stats.monthly.forEach((month, index) => {
    const x = pad.left + index * (barWidth + gap);
    const paidHeight = (month.paid / max) * chartHeight * progress;
    const openHeight = (month.receivable / max) * chartHeight * progress;
    const base = pad.top + chartHeight;
    ctx.fillStyle = "#0c6b58";
    roundRect(ctx, x, base - paidHeight, barWidth, paidHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#f0b35e";
    roundRect(ctx, x, base - paidHeight - openHeight, barWidth, openHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#66736c";
    ctx.fillText(month.label, x + 2, height - 16);
  });
  drawLegend(ctx, width - 190, 18, [["Pago", "#0c6b58"], ["A receber", "#f0b35e"]]);
}

function drawStatusChart(stats, progress) {
  const canvas = $("statusChart");
  const { ctx, width, height } = setupCanvas(canvas);
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radius = Math.min(width, height) * 0.32;
  const colors = ["#0c6b58", "#2f6f9f", "#f0b35e", "#b42318"];
  const total = Math.max(stats.statusTotals.reduce((sum, item) => sum + item.value, 0), 1);
  let start = -Math.PI / 2;
  stats.statusTotals.forEach((item, index) => {
    const slice = (item.value / total) * Math.PI * 2 * progress;
    ctx.beginPath();
    ctx.strokeStyle = colors[index];
    ctx.lineWidth = 34;
    ctx.arc(cx, cy, radius, start, start + slice);
    ctx.stroke();
    start += slice;
  });
  ctx.fillStyle = "#16201d";
  ctx.font = "800 24px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(stats.conversion)}%`, cx, cy - 2);
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillStyle = "#66736c";
  ctx.fillText("conversao", cx, cy + 20);
  ctx.textAlign = "left";
  drawLegend(ctx, 18, 18, stats.statusTotals.map((item, index) => [item.label, colors[index]]));
}

function drawLegend(ctx, x, y, entries) {
  ctx.font = "12px Segoe UI, Arial";
  entries.forEach(([label, color], index) => {
    const top = y + index * 20;
    ctx.fillStyle = color;
    roundRect(ctx, x, top, 12, 12, 3);
    ctx.fill();
    ctx.fillStyle = "#66736c";
    ctx.fillText(label, x + 18, top + 10);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  if (height <= 0 || width <= 0) return;
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function renderClientOptions() {
  const selected = fields.docClient.value;
  fields.docClient.replaceChildren();
  const empty = new Option("Selecione um cliente", "");
  fields.docClient.append(empty);
  state.clients.forEach((client) => fields.docClient.append(new Option(client.name, client.id)));
  fields.docClient.value = selected;
}

function renderClients() {
  const query = text($("clientSearch").value).toLowerCase();
  const list = $("clientList");
  list.replaceChildren();
  state.clients
    .filter((client) => [client.name, client.phone, client.email, client.taxId].join(" ").toLowerCase().includes(query))
    .forEach((client) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-item";
      item.addEventListener("click", () => editClient(client.id));
      item.append(line("strong", client.name), line("span", `${client.phone || "Sem telefone"} · ${client.email || "Sem email"}`));
      list.append(item);
    });
  if (!list.children.length) list.append(emptyMessage("Nenhum cliente encontrado."));
}

function renderDocs() {
  const query = text($("docSearch").value).toLowerCase();
  const list = $("docList");
  list.replaceChildren();
  state.docs
    .filter((doc) => {
      const client = getClient(doc.clientId);
      return [doc.id, doc.type, doc.status, doc.description, client?.name].join(" ").toLowerCase().includes(query);
    })
    .forEach((doc) => {
      const client = getClient(doc.clientId);
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-item";
      item.addEventListener("click", () => editDoc(doc.id));
      item.append(
        line("strong", `${doc.typeLabel || labelType(doc.type)} ${shortId(doc.id)}`),
        line("span", `${client?.name || "Cliente removido"} · ${labelStatus(doc.status)} · ${currency.format(docTotal(doc))}`)
      );
      list.append(item);
    });
  if (!list.children.length) list.append(emptyMessage("Nenhum documento encontrado."));
}

function renderRecentDocs() {
  const body = $("recentDocs");
  body.replaceChildren();
  state.docs.slice(0, 5).forEach((doc) => {
    const client = getClient(doc.clientId);
    const row = document.createElement("tr");
    [shortId(doc.id), client?.name || "Cliente removido", labelType(doc.type), labelStatus(doc.status), currency.format(docTotal(doc))]
      .forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
    body.append(row);
  });
  if (!body.children.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Nenhum documento criado ainda.";
    row.append(cell);
    body.append(row);
  }
}

function getClient(id) {
  return state.clients.find((client) => client.id === id);
}

function labelType(type) {
  return type === "recibo" ? "Recibo" : "Orcamento";
}

function labelStatus(status) {
  const labels = { aberto: "Aberto", aprovado: "Aprovado", pago: "Pago", cancelado: "Cancelado" };
  return labels[status] || status;
}

function shortId(id) {
  return String(id).slice(-6).toUpperCase();
}

function line(tag, value) {
  const element = document.createElement(tag);
  element.textContent = value;
  return element;
}

function emptyMessage(message) {
  const element = document.createElement("p");
  element.className = "empty";
  element.textContent = message;
  return element;
}

function printCurrentDocument() {
  const payload = getCurrentDocumentPayload("imprimir");
  if (!payload) return;
  const { doc, client } = payload;
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return toast("Permita pop-ups para imprimir.");
  printWindow.document.write(buildPrintHtml(doc, client));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function downloadAndShareCurrentDocument() {
  const payload = getCurrentDocumentPayload("baixar e compartilhar");
  if (!payload) return;
  const { doc, client } = payload;
  const filename = `${labelType(doc.type).toLowerCase()}-${shortId(doc.id)}.pdf`;
  const file = buildPdfFile(doc, client, filename);
  triggerDownload(file, filename);

  const shareData = {
    title: `${labelType(doc.type)} ${shortId(doc.id)}`,
    text: `${labelType(doc.type)} para ${client.name} no valor de ${currency.format(docTotal(doc))}.`
  };

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ ...shareData, files: [file] });
      toast("Documento baixado e compartilhamento aberto.");
      return;
    }
    if (navigator.share) {
      await navigator.share(shareData);
      toast("Documento baixado. Compartilhamento de texto aberto.");
      return;
    }
    toast("Documento baixado. Este navegador nao abriu compartilhamento automatico.");
  } catch (error) {
    if (error.name !== "AbortError") toast("Documento baixado, mas o compartilhamento nao abriu.");
  }
}

function getCurrentDocumentPayload(actionLabel) {
  const items = readItemRows();
  const client = getClient(fields.docClient.value);
  if (!client || !items.length) {
    toast(`Selecione cliente e itens antes de ${actionLabel}.`);
    return null;
  }
  return {
    client,
    doc: {
      id: fields.docId.value || "rascunho",
      type: fields.docType.value,
      status: fields.docStatus.value,
      date: fields.docDate.value,
      description: text(fields.docDescription.value),
      discount: number(fields.docDiscount.value),
      due: text(fields.docDue.value),
      items
    }
  };
}

function triggerDownload(file, filename) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildPdfFile(doc, client, filename) {
  const pdf = createPdfDocument(doc, client);
  return new File([pdf], filename, { type: "application/pdf" });
}

function createPdfDocument(doc, client) {
  const width = 595.28;
  const height = 841.89;
  const margin = 42;
  const right = width - margin;
  const pages = [[]];
  const total = docTotal(doc);
  const subtotal = (doc.items || []).reduce((sum, item) => sum + number(item.qty) * number(item.price), 0);
  let y = height - 44;

  const current = () => pages[pages.length - 1];
  const addPage = () => {
    pages.push([]);
    y = height - 62;
    drawMiniHeader();
  };
  const ensureSpace = (needed) => {
    if (y - needed < 92) addPage();
  };
  const command = (value) => current().push(value);
  const color = (hex, mode = "rg") => command(`${pdfColor(hex)} ${mode}`);
  const rect = (x, top, w, h, fill = "#ffffff") => {
    color(fill);
    command(`${x} ${(top - h).toFixed(2)} ${w} ${h} re f`);
  };
  const strokeLine = (x1, y1, x2, y2, stroke = "#dfe5df", lineWidth = 1) => {
    color(stroke, "RG");
    command(`${lineWidth} w ${x1} ${y1.toFixed(2)} m ${x2} ${y2.toFixed(2)} l S`);
  };
  const textAt = (value, x, top, size = 10, font = "F1", fill = "#16201d") => {
    color(fill);
    command(`BT /${font} ${size} Tf ${x} ${top.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
  };
  const rightText = (value, x, top, size = 10, font = "F1", fill = "#16201d") => {
    const approx = pdfClean(value).length * size * 0.52;
    textAt(value, x - approx, top, size, font, fill);
  };
  const textLine = (value, x, size = 10, font = "F1", fill = "#16201d") => {
    textAt(value, x, y, size, font, fill);
    y -= size + 7;
  };
  const wrappedText = (value, x, maxWidth, size = 10, font = "F1") => {
    wrapPdfText(value, maxWidth, size).forEach((line) => {
      ensureSpace(size + 8);
      textLine(line, x, size, font);
    });
  };
  const section = (title) => {
    ensureSpace(42);
    y -= 4;
    textLine(title.toUpperCase(), margin, 10, "F2", "#0c6b58");
    strokeLine(margin, y + 8, right, y + 8, "#dfe5df", 0.8);
    y -= 8;
  };
  const drawMiniHeader = () => {
    rect(0, height, width, 28, "#10231f");
    textAt(`${labelType(doc.type)} ${shortId(doc.id)}`, margin, height - 18, 9, "F2", "#ffffff");
    rightText(state.settings.bizName || "Minha Empresa", right, height - 18, 9, "F1", "#ffffff");
  };

  rect(0, height, width, 118, "#10231f");
  rect(0, height - 118, width, 5, "#f0b35e");
  textAt(labelType(doc.type).toUpperCase(), margin, height - 50, 28, "F2", "#ffffff");
  textAt(`Documento ${shortId(doc.id)} | Emitido em ${formatDate(doc.date)}`, margin, height - 74, 10, "F1", "#d8eee7");
  rect(right - 116, height - 37, 116, 30, statusColor(doc.status));
  textAt(labelStatus(doc.status).toUpperCase(), right - 102, height - 58, 10, "F2", "#ffffff");
  rightText(state.settings.bizName || "Minha Empresa", right, height - 48, 16, "F2", "#ffffff");
  rightText([state.settings.bizTaxId, state.settings.bizPhone].filter(Boolean).join(" | "), right, height - 68, 9, "F1", "#d8eee7");
  rightText(state.settings.bizEmail || "", right, height - 84, 9, "F1", "#d8eee7");

  y = height - 150;
  rect(margin, y + 18, 245, 88, "#f7faf8");
  rect(310, y + 18, 243, 88, "#f7faf8");
  textAt("CLIENTE", margin + 16, y, 9, "F2", "#0c6b58");
  textAt(client.name, margin + 16, y - 19, 14, "F2", "#16201d");
  textAt([client.taxId, client.phone].filter(Boolean).join(" | "), margin + 16, y - 38, 9, "F1", "#66736c");
  textAt(client.email || "", margin + 16, y - 53, 9, "F1", "#66736c");
  textAt("EMPRESA", 326, y, 9, "F2", "#0c6b58");
  textAt(state.settings.bizName || "Minha Empresa", 326, y - 19, 14, "F2", "#16201d");
  textAt(state.settings.bizAddress || "", 326, y - 38, 9, "F1", "#66736c");
  textAt(state.settings.bizEmail || "", 326, y - 53, 9, "F1", "#66736c");
  y -= 108;

  section("Resumo do servico");
  wrappedText(doc.description, margin, 500, 10, "F1");
  y -= 8;

  section("Itens do documento");
  rect(margin, y + 20, width - margin * 2, 30, "#0c6b58");
  textAt("Descricao", margin + 12, y, 9, "F2", "#ffffff");
  textAt("Qtd.", 320, y, 9, "F2", "#ffffff");
  rightText("Valor", 425, y, 9, "F2", "#ffffff");
  rightText("Total", right - 12, y, 9, "F2", "#ffffff");
  y -= 26;

  doc.items.forEach((item, index) => {
    const rowLines = wrapPdfText(item.description, 250, 9);
    const rowHeight = Math.max(32, rowLines.length * 13 + 14);
    ensureSpace(rowHeight + 8);
    if (index % 2 === 0) rect(margin, y + 14, width - margin * 2, rowHeight, "#fbfcfb");
    rowLines.forEach((line, lineIndex) => textAt(line, margin + 12, y - lineIndex * 13, 9, "F1", "#16201d"));
    const rowTop = y;
    const lineTotal = number(item.qty) * number(item.price);
    textAt(item.qty, 320, rowTop, 9, "F1", "#16201d");
    rightText(currency.format(item.price), 425, rowTop, 9, "F1", "#16201d");
    rightText(currency.format(lineTotal), right - 12, rowTop, 9, "F2", "#16201d");
    strokeLine(margin, y - rowHeight + 10, right, y - rowHeight + 10, "#dfe5df", 0.7);
    y -= rowHeight;
  });

  y -= 14;
  ensureSpace(118);
  rect(338, y + 20, 215, 102, "#eef6f2");
  textAt("Resumo financeiro", 356, y, 10, "F2", "#0c6b58");
  textAt("Subtotal", 356, y - 24, 10, "F1", "#66736c");
  rightText(currency.format(subtotal), 532, y - 24, 10, "F1", "#16201d");
  textAt("Desconto", 356, y - 45, 10, "F1", "#66736c");
  rightText(currency.format(number(doc.discount)), 532, y - 45, 10, "F1", "#16201d");
  strokeLine(356, y - 58, 532, y - 58, "#cbdad2", 0.8);
  textAt("Total", 356, y - 80, 15, "F2", "#16201d");
  rightText(currency.format(total), 532, y - 80, 15, "F2", "#0c6b58");
  y -= 122;

  section("Condicoes");
  wrappedText(`Prazo/validade: ${doc.due || "Nao informado"}`, margin, 500, 10, "F2");
  wrappedText(state.settings.bizMessage || "Obrigado pela preferencia.", margin, 500, 10, "F1");
  y -= 28;

  ensureSpace(90);
  strokeLine(margin, y, 238, y, "#66736c", 0.8);
  strokeLine(330, y, right, y, "#66736c", 0.8);
  textAt("Assinatura do prestador", margin, y - 18, 9, "F1", "#66736c");
  textAt("Assinatura do cliente", 330, y - 18, 9, "F1", "#66736c");

  pages.forEach((page, index) => {
    page.push(`0.40 0.45 0.42 RG 42 54 m 553 54 l S`);
    page.push(`BT /F1 8 Tf 42 36 Td (${pdfEscape("Documento gerado pelo MicroCRM Recibos e Orcamentos")}) Tj ET`);
    page.push(`BT /F1 8 Tf 503 36 Td (${pdfEscape(`Pagina ${index + 1}/${pages.length}`)}) Tj ET`);
  });

  return assemblePdf(pages, width, height);
}

function pdfColor(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function statusColor(status) {
  const colors = {
    pago: "#0c6b58",
    aprovado: "#2f6f9f",
    aberto: "#c2702c",
    cancelado: "#b42318"
  };
  return colors[status] || "#66736c";
}

function assemblePdf(pages, width, height) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  ];
  const pageIds = [];
  pages.forEach((commands) => {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const stream = commands.join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function wrapPdfText(value, maxWidth, size) {
  const textValue = pdfClean(value);
  const maxChars = Math.max(12, Math.floor(maxWidth / (size * 0.52)));
  const words = textValue.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function pdfClean(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ");
}

function pdfEscape(value) {
  return pdfClean(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPrintHtml(doc, client) {
  const safe = escapeHtml;
  const rows = doc.items.map((item) => `
    <tr>
      <td>${safe(item.description)}</td>
      <td>${safe(item.qty)}</td>
      <td>${currency.format(item.price)}</td>
      <td>${currency.format(item.qty * item.price)}</td>
    </tr>`).join("");
  return `<!doctype html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>${safe(labelType(doc.type))} ${safe(shortId(doc.id))}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #16201d; margin: 36px; }
      header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #0c6b58; padding-bottom: 18px; }
      h1 { margin: 0 0 8px; }
      h2 { margin-top: 28px; }
      p { margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border-bottom: 1px solid #dfe5df; padding: 10px; text-align: left; }
      .total { margin-top: 22px; text-align: right; font-size: 1.25rem; font-weight: 800; }
      .muted { color: #66736c; }
    </style>
  </head>
  <body>
    <header>
      <div>
        <h1>${safe(labelType(doc.type))}</h1>
        <p class="muted">Codigo ${safe(shortId(doc.id))} · ${safe(formatDate(doc.date))} · ${safe(labelStatus(doc.status))}</p>
      </div>
      <div>
        <strong>${safe(state.settings.bizName)}</strong>
        <p>${safe(state.settings.bizTaxId)}</p>
        <p>${safe(state.settings.bizPhone)} ${safe(state.settings.bizEmail)}</p>
        <p>${safe(state.settings.bizAddress)}</p>
      </div>
    </header>
    <h2>Cliente</h2>
    <p><strong>${safe(client.name)}</strong></p>
    <p>${safe(client.taxId)} · ${safe(client.phone)} · ${safe(client.email)}</p>
    <p>${safe(client.address)}</p>
    <h2>Servico</h2>
    <p>${safe(doc.description)}</p>
    <table>
      <thead><tr><th>Item</th><th>Qtd.</th><th>Valor</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="total">Total: ${currency.format(docTotal(doc))}</p>
    <p class="muted">Prazo/validade: ${safe(doc.due || "Nao informado")}</p>
    <p>${safe(state.settings.bizMessage)}</p>
  </body>
  </html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function toast(message) {
  const toastBox = $("toast");
  toastBox.textContent = message;
  toastBox.classList.add("show");
  clearTimeout(toastBox.timer);
  toastBox.timer = setTimeout(() => toastBox.classList.remove("show"), 2800);
}