const tbody      = document.getElementById('tbody');
const emptyMsg   = document.getElementById('empty');
const loadingMsg = document.getElementById('loading');
const totalInfo  = document.getElementById('total-info');
const toast      = document.getElementById('toast');

let todos = [];

// ── Init ───────────────────────────────────────────────
let searchTimer;
document.getElementById('search-municipio').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => render(filtrar(e.target.value)), 200);
});

document.getElementById('btn-importar-municipios').addEventListener('click', importar);

load();

// ── Data ───────────────────────────────────────────────
async function load() {
  loadingMsg.hidden = false;
  tbody.innerHTML = '';
  try {
    const res  = await fetch('/api/municipios/');
    todos = await res.json();
    render(todos);
  } catch {
    showToast('Erro ao carregar municípios.');
  } finally {
    loadingMsg.hidden = true;
  }
}

async function importar() {
  const btn = document.getElementById('btn-importar-municipios');
  btn.disabled = true;
  btn.textContent = 'Atualizando...';
  try {
    const res  = await fetch('/api/importar-municipios/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() },
    });
    const data = await res.json();
    showToast(res.ok ? data.mensagem : data.erro);
    if (res.ok) load();
  } catch {
    showToast('Erro ao conectar com a API do IBGE.');
  } finally {
    btn.disabled = false;
    btn.textContent = '↻ Atualizar via IBGE';
  }
}

// ── Render ─────────────────────────────────────────────
function filtrar(termo) {
  const t = termo.trim().toLowerCase();
  return t ? todos.filter(m => m.nome.toLowerCase().includes(t)) : todos;
}

function render(lista) {
  tbody.innerHTML = '';
  emptyMsg.hidden = lista.length > 0;
  totalInfo.textContent = lista.length === todos.length
    ? `${todos.length} municípios cadastrados`
    : `${lista.length} de ${todos.length} municípios`;

  lista.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${esc(m.nome)}</td><td>${esc(String(m.codigo_ibge))}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Helpers ────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCsrf() {
  return document.cookie.split('; ')
    .find(r => r.startsWith('csrftoken='))
    ?.split('=')[1] ?? '';
}
