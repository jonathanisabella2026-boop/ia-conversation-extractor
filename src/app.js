// ==========================================
// IA Conversation Extractor - FULL EDITION
// DIGITAL SolutJon
// GitHub-ready release
// ==========================================

let blocks = [];
let currentTemplate = 'all';
let previewOnlySelected = false;
let dragSrcEl = null;

const TEMPLATES = {
  all: { name: 'Completa', selectAll: true },
  tech: {
    name: 'Técnica',
    scores: { code: 10, heading: 4, list: 5, text: 1, quote: 3 },
    keywords: ['error', 'fix', 'solución', 'comando', 'instalar', 'configurar', 'debug', 'console', 'function', 'const', 'let', 'import', 'npm', 'git', 'docker'],
    minScore: 3
  },
  creative: {
    name: 'Creativa',
    scores: { code: 2, heading: 5, list: 6, text: 4, quote: 5 },
    keywords: ['idea', 'creativo', 'concepto', 'diseño', 'inspiración', 'brainstorm', 'tema', 'estilo', 'color', 'nombre', 'título'],
    minScore: 4
  },
  summary: {
    name: 'Resumen',
    scores: { code: 3, heading: 8, list: 7, text: 5, quote: 6 },
    keywords: ['conclusión', 'resumen', 'en resumen', 'finalmente', 'por tanto', 'clave', 'importante', 'recuerda', 'esencial', 'tl;dr'],
    minScore: 5
  },
  tutorial: {
    name: 'Tutorial',
    scores: { code: 9, heading: 6, list: 10, text: 2, quote: 4 },
    keywords: ['paso', 'step', 'primero', 'segundo', 'luego', 'después', 'finalmente', 'ejemplo', 'práctica', 'ejercicio', 'guía'],
    minScore: 4
  }
};

const el = {
  input: document.getElementById('inputText'),
  blocks: document.getElementById('blocksContainer'),
  preview: document.getElementById('previewSection'),
  previewText: document.getElementById('previewText'),
  inputStats: document.getElementById('inputStats'),
  outputStats: document.getElementById('outputStats'),
  template: document.getElementById('templateSelect'),
  search: document.getElementById('searchBlocks')
};

// Event Listeners
document.getElementById('btnPaste').addEventListener('click', pasteFromClipboard);
document.getElementById('btnAnalyze').addEventListener('click', () => analyze('all'));
document.getElementById('btnOnlyAI').addEventListener('click', () => filterRole('ai'));
document.getElementById('btnOnlyUser').addEventListener('click', () => filterRole('user'));
document.getElementById('btnOnlyCode').addEventListener('click', () => filterType('code'));
document.getElementById('btnClear').addEventListener('click', clearAll);
document.getElementById('btnSave').addEventListener('click', saveMarkdown);
document.getElementById('btnCopyPreview').addEventListener('click', copyPreview);
document.getElementById('btnPreviewOnly').addEventListener('click', togglePreviewMode);
document.getElementById('btnTheme').addEventListener('click', toggleTheme);
el.template.addEventListener('change', (e) => { currentTemplate = e.target.value; });
el.search.addEventListener('input', filterSearch);

// Atajos de teclado
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); analyze('all'); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveMarkdown(); }
  if (e.ctrlKey && e.key === 't') { e.preventDefault(); toggleTheme(); }
  if (e.ctrlKey && e.shiftKey && e.key === 'V') { e.preventDefault(); pasteFromClipboard(); }
});

// ==========================================
// TEMA
// ==========================================

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ia-extractor-theme', next);
}

const savedTheme = localStorage.getItem('ia-extractor-theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

// ==========================================
// PORTAPAPELES
// ==========================================

async function pasteFromClipboard() {
  try {
    const text = await window.electronAPI.readClipboard();
    if (text) {
      el.input.value = text;
      analyze('all');
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    alert('No se pudo leer el portapapeles. Usa Ctrl+V manualmente.');
  }
}

// ==========================================
// DETECCIÓN DE ROLES
// ==========================================

function detectRoles(text) {
  const patterns = {
    user: [
      /^You\s*[
:]/mi, /^User\s*[
:]/mi, /^Usuario\s*[
:]/mi,
      /^Humano\s*[
:]/mi, /^Tú\s*[
:]/mi, /^Prompt\s*[
:]/mi,
      /^Human\s*[
:]/mi, /^\*\*You\*\*/mi, /^\*\*User\*\*/mi,
      /^\*\*Usuario\*\*/mi, /^👤/m, /^>\s*(You|User|Usuario|Humano)/mi,
      /^You said:/mi, /^Usuario dijo:/mi
    ],
    ai: [
      /^ChatGPT\s*[
:]/mi, /^Claude\s*[
:]/mi, /^Gemini\s*[
:]/mi,
      /^Copilot\s*[
:]/mi, /^Assistant\s*[
:]/mi, /^AI\s*[
:]/mi,
      /^Asistente\s*[
:]/mi, /^\*\*ChatGPT\*\*/mi, /^\*\*Claude\*\*/mi,
      /^\*\*Gemini\*\*/mi, /^🤖/m, /^>\s*(ChatGPT|Claude|Gemini|Copilot|Assistant)/mi,
      /^ChatGPT said:/mi, /^Claude said:/mi, /^Asistente respondió:/mi,
      /^DeepSeek\s*[
:]/mi, /^Perplexity\s*[
:]/mi
    ]
  };

  const lines = text.split('
');
  let segments = [];
  let current = { role: 'unknown', lines: [] };

  function flush() {
    if (current.lines.length > 0) {
      const txt = current.lines.join('
').trim();
      if (txt) segments.push({ role: current.role, text: txt });
    }
  }

  for (let line of lines) {
    let detected = null;
    for (const [role, regexes] of Object.entries(patterns)) {
      if (regexes.some(rx => rx.test(line))) {
        detected = role;
        break;
      }
    }

    if (detected) {
      flush();
      current = { role: detected, lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  flush();

  // Fallback heurístico: alternar párrafos largos
  if (segments.length <= 1 && text.length > 100) {
    const paragraphs = text.split(/
\s*
/).filter(p => p.trim().length > 20);
    if (paragraphs.length > 1) {
      return paragraphs.map((p, i) => ({
        role: i % 2 === 0 ? 'user' : 'ai',
        text: p.trim()
      }));
    }
  }

  return segments.length > 0 ? segments : [{ role: 'unknown', text: text.trim() }];
}

// ==========================================
// PARSEO DE BLOQUES
// ==========================================

function parseBlocks(segments) {
  const allBlocks = [];
  let idCounter = 0;

  segments.forEach(seg => {
    const lines = seg.text.split('
');
    let current = { type: 'text', lines: [] };

    function flushBlock() {
      if (current.lines.length === 0) return;
      const text = current.lines.join('
').trim();
      if (!text) return;

      let type = current.type;
      if (type === 'text') {
        if (/^#{1,6}\s/.test(text)) type = 'heading';
        else if (/^(>|•|-|\d+\.)\s/m.test(text)) type = 'list';
        else if (/^>\s/.test(text)) type = 'quote';
      }

      allBlocks.push({
        id: idCounter++,
        role: seg.role,
        type,
        text,
        selected: true,
        score: 0
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^```/.test(line)) {
        flushBlock();
        current = { type: 'code', lines: [line] };
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          current.lines.push(lines[i]);
          i++;
        }
        if (i < lines.length) current.lines.push(lines[i]);
        flushBlock();
        current = { type: 'text', lines: [] };
        continue;
      }

      if (/^#{1,6}\s/.test(line)) {
        flushBlock();
        current = { type: 'heading', lines: [line] };
        flushBlock();
        current = { type: 'text', lines: [] };
        continue;
      }

      if (line.trim() === '') {
        flushBlock();
        current = { type: 'text', lines: [] };
      } else {
        current.lines.push(line);
      }
    }
    flushBlock();
  });

  return allBlocks;
}

// ==========================================
// SCORING POR PLANTILLA
// ==========================================

function applyTemplate(blocks, templateKey) {
  const tpl = TEMPLATES[templateKey];
  if (!tpl || tpl.selectAll) return blocks;

  return blocks.map(b => {
    let score = tpl.scores[b.type] || 1;
    const lower = b.text.toLowerCase();

    if (tpl.keywords) {
      tpl.keywords.forEach(kw => {
        if (lower.includes(kw)) score += 3;
      });
    }

    if (/^(hola|hey|buenas|saludos)/i.test(b.text) && b.text.length < 60) score -= 5;
    if (/en qué puedo ayudarte/i.test(lower)) score -= 5;
    if (/^gracias/i.test(b.text) && b.text.length < 40) score -= 3;

    return { ...b, score, selected: score >= tpl.minScore };
  });
}

// ==========================================
// ANÁLISIS
// ==========================================

function analyze(mode) {
  const raw = el.input.value.trim();
  if (!raw) { alert('Primero pega una conversación.'); return; }

  const segments = detectRoles(raw);
  blocks = parseBlocks(segments);
  blocks = applyTemplate(blocks, currentTemplate);

  if (mode === 'ai') blocks.forEach(b => b.selected = (b.role === 'ai'));
  if (mode === 'user') blocks.forEach(b => b.selected = (b.role === 'user'));
  if (mode === 'code') blocks.forEach(b => b.selected = (b.type === 'code'));

  renderBlocks();
  updatePreview();
}

function filterRole(role) {
  if (blocks.length === 0) { analyze(role); return; }
  blocks.forEach(b => b.selected = (b.role === role));
  renderBlocks();
  updatePreview();
}

function filterType(type) {
  if (blocks.length === 0) { analyze(type); return; }
  blocks.forEach(b => b.selected = (b.type === type));
  renderBlocks();
  updatePreview();
}

// ==========================================
// BÚSQUEDA
// ==========================================

function filterSearch() {
  const query = el.search.value.toLowerCase().trim();
  const blockEls = document.querySelectorAll('.block');

  blockEls.forEach((el, idx) => {
    const b = blocks[idx];
    if (!b) return;
    if (!query || b.text.toLowerCase().includes(query)) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// ==========================================
// DRAG & DROP
// ==========================================

function setupDragEvents(el, idx) {
  el.setAttribute('draggable', 'true');

  el.addEventListener('dragstart', (e) => {
    dragSrcEl = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', el.innerHTML);
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.block').forEach(b => b.classList.remove('drag-over'));
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  });

  el.addEventListener('dragenter', () => {
    if (el !== dragSrcEl) el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });

  el.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
    el.classList.remove('drag-over');

    if (dragSrcEl !== el) {
      const srcIdx = parseInt(dragSrcEl.dataset.index);
      const dstIdx = parseInt(el.dataset.index);

      const [moved] = blocks.splice(srcIdx, 1);
      blocks.splice(dstIdx, 0, moved);

      blocks.forEach((b, i) => b.id = i);

      renderBlocks();
      updatePreview();
    }
    return false;
  });
}

// ==========================================
// EDICIÓN INLINE
// ==========================================

function startEdit(id) {
  const b = blocks.find(x => x.id === id);
  if (!b) return;

  const editDiv = document.getElementById(`edit-${id}`);
  const textarea = document.getElementById(`edit-text-${id}`);

  editDiv.classList.add('active');
  textarea.value = b.text;
  textarea.focus();
}

function saveEdit(id) {
  const b = blocks.find(x => x.id === id);
  if (!b) return;

  const textarea = document.getElementById(`edit-text-${id}`);
  b.text = textarea.value;

  document.getElementById(`edit-${id}`).classList.remove('active');
  renderBlocks();
  updatePreview();
}

function cancelEdit(id) {
  document.getElementById(`edit-${id}`).classList.remove('active');
}

// ==========================================
// RENDER
// ==========================================

function renderBlocks() {
  if (blocks.length === 0) {
    el.blocks.innerHTML = `<div class="empty-state"><p>No hay bloques para mostrar</p></div>`;
    updateStats();
    return;
  }

  el.blocks.innerHTML = blocks.map((b, idx) => {
    const roleClass = `badge-${b.role}`;
    const roleLabel = b.role === 'user' ? 'Usuario' : b.role === 'ai' ? 'IA' : 'Desconocido';
    const typeLabel = b.type === 'code' ? 'Código' : b.type === 'heading' ? 'Título' : b.type === 'list' ? 'Lista' : b.type === 'quote' ? 'Cita' : 'Texto';

    let content = '';
    if (b.type === 'code') {
      content = `<pre>${escapeHtml(b.text)}</pre>`;
    } else if (b.type === 'heading') {
      content = `<p style="font-weight:700; font-size:1rem;">${escapeHtml(b.text.replace(/^#{1,6}\s*/, ''))}</p>`;
    } else {
      const preview = b.text.length > 300 ? b.text.substring(0, 300) + '...' : b.text;
      content = `<p>${escapeHtml(preview)}</p>`;
    }

    return `
      <div class="block ${b.selected ? 'selected' : ''}" 
           data-index="${idx}" 
           onclick="toggleBlock(${b.id})">
        <div class="drag-handle" title="Arrastrar para ordenar (Drag & Drop)">⋮⋮</div>
        <div class="block-header">
          <span class="badge ${roleClass}">${roleLabel}</span>
          <span class="badge badge-type">${typeLabel}</span>
          ${b.score > 0 ? `<span class="badge badge-type">Score: ${b.score}</span>` : ''}
        </div>
        <div class="block-content">${content}</div>

        <div id="edit-${b.id}" class="block-edit">
          <textarea id="edit-text-${b.id}"></textarea>
          <div class="block-actions" onclick="event.stopPropagation()">
            <button class="btn-edit" onclick="saveEdit(${b.id})">💾 Guardar</button>
            <button class="btn-edit" onclick="cancelEdit(${b.id})">❌ Cancelar</button>
          </div>
        </div>

        <div class="block-actions" onclick="event.stopPropagation()">
          <button class="btn-toggle" onclick="setRole(${b.id}, 'user')">👤 Usuario</button>
          <button class="btn-toggle" onclick="setRole(${b.id}, 'ai')">🤖 IA</button>
          <button class="btn-toggle" onclick="setRole(${b.id}, 'unknown')">❓ Reset</button>
          <button class="btn-edit" onclick="startEdit(${b.id})">✏️ Editar</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.block').forEach((blockEl, idx) => {
    setupDragEvents(blockEl, idx);
  });

  if (el.search.value) filterSearch();

  updateStats();
}

function toggleBlock(id) {
  const b = blocks.find(x => x.id === id);
  if (b) { b.selected = !b.selected; renderBlocks(); updatePreview(); }
}

function setRole(id, role) {
  const b = blocks.find(x => x.id === id);
  if (b) { b.role = role; renderBlocks(); updatePreview(); }
}

// ==========================================
// MARKDOWN
// ==========================================

function buildMarkdown() {
  const source = previewOnlySelected ? blocks.filter(b => b.selected) : blocks;
  const selected = blocks.filter(b => b.selected);
  const now = new Date().toLocaleString('es-ES');

  let md = `# Extracto de Conversación con IA

`;
  md += `> **Generado por:** IA Extractor - DIGITAL SolutJon  
`;
  md += `> **Fecha:** ${now}  
`;
  md += `> **Plantilla:** ${TEMPLATES[currentTemplate].name}  
`;
  md += `> **Bloques incluidos:** ${selected.length} de ${blocks.length}

`;
  md += `---

`;

  let lastRole = null;
  source.forEach(b => {
    if (b.role !== lastRole && b.role !== 'unknown') {
      md += `
### 💬 ${b.role === 'user' ? 'Usuario' : 'Asistente IA'}

`;
      lastRole = b.role;
    }

    if (b.type === 'code') md += b.text + '

';
    else if (b.type === 'heading') md += b.text + '

';
    else md += b.text + '

';
  });

  md += `---

*Documento generado offline con IA Extractor - DIGITAL SolutJon*`;
  return md;
}

function updatePreview() {
  const selected = blocks.filter(b => b.selected).length;
  if (selected === 0) {
    el.preview.style.display = 'none';
    return;
  }
  el.preview.style.display = 'block';
  el.previewText.textContent = buildMarkdown();
}

function togglePreviewMode() {
  previewOnlySelected = !previewOnlySelected;
  const btn = document.getElementById('btnPreviewOnly');
  btn.textContent = previewOnlySelected ? '👁 Todos los bloques' : '👁 Solo seleccionados';
  btn.style.borderColor = previewOnlySelected ? 'var(--accent)' : 'var(--border)';
  updatePreview();
}

async function saveMarkdown() {
  const selected = blocks.filter(b => b.selected);
  if (selected.length === 0) return alert('Selecciona al menos un bloque.');

  const md = buildMarkdown();
  const defaultName = `extracto-${new Date().toISOString().slice(0,10)}.md`;

  try {
    const result = await window.electronAPI.saveMarkdown({
      content: md,
      defaultPath: defaultName
    });
    if (result.success) {
      alert(`✅ Guardado en:
${result.path}`);
    } else if (result.canceled) {
      // Usuario canceló, no hacer nada
    } else {
      alert('Error al guardar: ' + (result.error || 'Desconocido'));
    }
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
}

function copyPreview() {
  const md = buildMarkdown();
  navigator.clipboard.writeText(md).then(() => {
    const btn = document.getElementById('btnCopyPreview');
    const old = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => btn.textContent = old, 1500);
  }).catch(() => {
    alert('No se pudo copiar al portapapeles.');
  });
}

function clearAll() {
  el.input.value = '';
  blocks = [];
  el.search.value = '';
  renderBlocks();
  updatePreview();
}

// ==========================================
// UTILS
// ==========================================

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateStats() {
  const total = blocks.length;
  const sel = blocks.filter(b => b.selected).length;
  const users = blocks.filter(b => b.role === 'user').length;
  const ais = blocks.filter(b => b.role === 'ai').length;

  el.inputStats.textContent = total ? `${blocks.reduce((a,b) => a + b.text.length, 0)} chars` : '';
  el.outputStats.textContent = total 
    ? `${sel} incluidos · ${total-sel} excluidos · 👤${users} · 🤖${ais}` 
    : '';
}

// Inicializar
renderBlocks();
