const API = '/api/empreendimentos/';

const SEGMENTOS = [
  { value: 'tecnologia',  label: 'Tecnologia' },
  { value: 'comercio',    label: 'Comércio' },
  { value: 'industria',   label: 'Indústria' },
  { value: 'servicos',    label: 'Serviços' },
  { value: 'agronegocio', label: 'Agronegócio' },
];

// ── State ──────────────────────────────────────────────
let state = { page: 1, segmento: '', status: '', search: '' };
let currentId = null;

// ── DOM refs ───────────────────────────────────────────
const tbody      = document.getElementById('tbody');
const emptyMsg   = document.getElementById('empty');
const loadingMsg = document.getElementById('loading');
const pageInfo   = document.getElementById('page-info');
const btnPrev    = document.getElementById('btn-prev');
const btnNext    = document.getElementById('btn-next');
const overlay    = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const form       = document.getElementById('form');
const toast      = document.getElementById('toast');

// ── Init ───────────────────────────────────────────────
document.getElementById('filter-segmento').addEventListener('change', e => {
  state.segmento = e.target.value; state.page = 1; load();
});
document.getElementById('filter-status').addEventListener('change', e => {
  state.status = e.target.value; state.page = 1; load();
});
let searchTimer;
document.getElementById('search').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = e.target.value; state.page = 1; load(); }, 350);
});

btnPrev.addEventListener('click', () => { state.page--; load(); });
btnNext.addEventListener('click', () => { state.page++; load(); });

document.getElementById('btn-novo').addEventListener('click', () => openModal());
document.getElementById('btn-cancelar').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
form.addEventListener('submit', save);
document.getElementById('btn-importar-municipios').addEventListener('click', importarMunicipios);

// ── Phone mask ─────────────────────────────────────────
function mascaraTelefone(v) {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10)
    return v.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      a ? `(${a}${b ? `) ${b}${c ? `-${c}` : ''}` : ''})` : '');
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ''}`);
}

document.getElementById('telefone').addEventListener('input', function () {
  const pos = this.selectionStart;
  const prev = this.value.length;
  this.value = mascaraTelefone(this.value);
  const diff = this.value.length - prev;
  this.setSelectionRange(pos + diff, pos + diff);
});

load();
loadMunicipios();

// ── Municípios ─────────────────────────────────────────
async function loadMunicipios() {
  try {
    const res  = await fetch('/api/municipios/');
    const data = await res.json();
    const dl   = document.getElementById('municipios-list');
    data.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.nome;
      dl.appendChild(opt);
    });
  } catch {
    // silently fail — validation still happens on the server
  }
}

// ── Data ───────────────────────────────────────────────
async function load() {
  showLoading(true);
  const params = new URLSearchParams({ page: state.page });
  if (state.segmento) params.set('segmento', state.segmento);
  if (state.status)   params.set('status',   state.status);
  if (state.search)   params.set('search',   state.search);

  try {
    const res  = await fetch(`${API}?${params}`);
    const data = await res.json();
    render(data.results || []);
    updatePagination(data);
  } catch {
    showToast('Erro ao carregar dados.');
  } finally {
    showLoading(false);
  }
}

async function save(e) {
  e.preventDefault();
  if (!validateForm()) return;
  const payload = getFormData();
  const url    = currentId ? `${API}${currentId}/` : API;
  const method = currentId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast('Erro: ' + Object.values(err).flat().join(' '));
      return;
    }
    closeModal();
    showToast(currentId ? 'Empreendimento atualizado.' : 'Empreendimento cadastrado.');
    load();
  } catch {
    showToast('Erro ao salvar.');
  }
}

async function importarMunicipios() {
  const btn = document.getElementById('btn-importar-municipios');
  btn.disabled = true;
  btn.textContent = 'Atualizando...';
  try {
    const res = await fetch('/api/importar-municipios/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() },
    });
    const data = await res.json();
    showToast(res.ok ? data.mensagem : data.erro);
  } catch {
    showToast('Erro ao conectar com a API do IBGE.');
  } finally {
    btn.disabled = false;
    btn.textContent = '↻ Atualizar Municípios';
  }
}

async function remove(id, nome) {
  if (!confirm(`Excluir "${nome}"?`)) return;
  try {
    const res = await fetch(`${API}${id}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCsrf() },
    });
    if (!res.ok) { showToast('Erro ao excluir.'); return; }
    showToast('Empreendimento removido.');
    load();
  } catch {
    showToast('Erro ao excluir.');
  }
}

// ── Render ─────────────────────────────────────────────
function render(items) {
  tbody.innerHTML = '';
  emptyMsg.hidden = items.length > 0;

  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${esc(item.nome)}</td>
      <td>${esc(item.nome_empreendedor)}</td>
      <td>${esc(item.municipio)}</td>
      <td><span class="seg-badge">${esc(item.segmento_display)}</span></td>
      <td><span class="badge badge-${item.status}">${esc(item.status_display)}</span></td>
      <td class="td-actions">
        <button class="btn btn-secondary btn-sm">Editar</button>
        <button class="btn btn-danger btn-sm">Excluir</button>
      </td>`;
    tr.querySelector('.btn-secondary').addEventListener('click', () => openModal(item));
    tr.querySelector('.btn-danger').addEventListener('click', () => remove(item.id, item.nome));
    tbody.appendChild(tr);
  });
}

function updatePagination(data) {
  const total = data.count || 0;
  const size  = 10;
  const pages = Math.ceil(total / size) || 1;
  pageInfo.textContent = `Página ${state.page} de ${pages} (${total} registro${total !== 1 ? 's' : ''})`;
  btnPrev.disabled = !data.previous;
  btnNext.disabled = !data.next;
}

// ── Modal ──────────────────────────────────────────────
function openModal(item = null) {
  currentId = item ? item.id : null;
  modalTitle.textContent = item ? 'Editar empreendimento' : 'Novo empreendimento';

  // Populate selects dynamically once
  buildSelects();

  const f = form;
  f.nome.value             = item?.nome             ?? '';
  f.nome_empreendedor.value= item?.nome_empreendedor ?? '';
  f.municipio.value        = item?.municipio         ?? '';
  f.segmento.value         = item?.segmento          ?? '';
  f.email.value            = item?.email             ?? '';
  f.telefone.value         = mascaraTelefone(item?.telefone ?? '');
  f.status.value           = item?.status            ?? 'ativo';
  f.descricao.value        = item?.descricao         ?? '';
  f.data_fundacao.value    = item?.data_fundacao      ?? '';
  f.data_fundacao.max      = new Date().toISOString().slice(0, 10);

  clearFieldErrors();
  overlay.classList.add('open');
  f.nome.focus();
}

function closeModal() {
  overlay.classList.remove('open');
  clearFieldErrors();
  form.reset();
  currentId = null;
}

function buildSelects() {
  const segEl = form.segmento;
  if (segEl.options.length > 1) return; // already built
  SEGMENTOS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.value; opt.textContent = s.label;
    segEl.appendChild(opt);
  });
}

function getFormData() {
  const f = form;
  const data = {
    nome:              f.nome.value.trim(),
    nome_empreendedor: f.nome_empreendedor.value.trim(),
    municipio:         f.municipio.value.trim(),
    segmento:          f.segmento.value,
    email:             f.email.value.trim(),
    telefone:          f.telefone.value.trim(),
    status:            f.status.value,
    descricao:         f.descricao.value.trim(),
  };
  const df = f.data_fundacao.value;
  if (df) data.data_fundacao = df;
  return data;
}

// ── Front-end validation ───────────────────────────────
function validateForm() {
  clearFieldErrors();
  let valid = true;
  const f = form;
  const today = new Date().toISOString().slice(0, 10);

  ['nome', 'nome_empreendedor', 'municipio', 'segmento', 'email', 'telefone'].forEach(name => {
    if (!f[name].value.trim()) {
      setFieldError(name, 'Campo obrigatório.');
      valid = false;
    }
  });

  if (f.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) {
    setFieldError('email', 'Informe um endereço de e-mail válido.');
    valid = false;
  }

  const digits = f.telefone.value.replace(/\D/g, '');
  if (f.telefone.value.trim() && digits.length !== 10 && digits.length !== 11) {
    setFieldError('telefone', 'Informe um telefone válido: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.');
    valid = false;
  }

  if (f.data_fundacao.value && f.data_fundacao.value > today) {
    setFieldError('data_fundacao', 'A data de fundação não pode ser maior que hoje.');
    valid = false;
  }

  return valid;
}

function setFieldError(name, msg) {
  const el = form[name];
  el.classList.add('field-invalid');
  const span = document.createElement('span');
  span.className = 'field-error';
  span.textContent = msg;
  el.parentElement.appendChild(span);
}

function clearFieldErrors() {
  form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}

// ── Helpers ────────────────────────────────────────────
function showLoading(on) {
  loadingMsg.hidden = !on;
  if (on) tbody.innerHTML = '';
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
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
