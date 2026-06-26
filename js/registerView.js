// Renders the Document Register view: a searchable, filterable list of every
// controlled document across all entities.

import { getRegisterRows } from './register.js';
import { getEntities } from './store.js';
import { DOCUMENT_TYPES, COR_DOC_LABEL } from './config.js';
import { escapeHtml } from './utils.js';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Keep the entity filter in sync with the current entities, preserving the
// user's current selection. The document-type filter is static.
function populateFilters() {
  const entitySelect = document.getElementById('registerEntityFilter');
  const current = entitySelect.value;
  const options = ['<option value="">All entities</option>']
    .concat(getEntities().map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)}</option>`));
  entitySelect.innerHTML = options.join('');
  entitySelect.value = current;

  const typeSelect = document.getElementById('registerTypeFilter');
  if (!typeSelect.dataset.ready) {
    const types = [...DOCUMENT_TYPES.map((t) => t.label), COR_DOC_LABEL];
    typeSelect.innerHTML = ['<option value="">All document types</option>']
      .concat(types.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`))
      .join('');
    typeSelect.dataset.ready = '1';
  }
}

function rowHtml(r) {
  const file = escapeHtml(r.fileName);
  return `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">${escapeHtml(r.id)}</td>
      <td class="px-4 py-3 text-slate-700">${escapeHtml(r.entityName)}</td>
      <td class="px-4 py-3"><span class="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">${escapeHtml(r.docType)}</span></td>
      <td class="px-4 py-3 text-slate-600">${escapeHtml(r.formType)}</td>
      <td class="px-4 py-3 text-slate-600">${escapeHtml(r.period)}</td>
      <td class="px-4 py-3">
        <button data-action="open-viewer" data-file="${file}" class="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left flex items-center gap-1" title="View ${file}">
          <i class="ph ph-file-text"></i> <span class="truncate max-w-[220px]">${file}</span>
        </button>
      </td>
      <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">${formatDate(r.createdAt)}</td>
    </tr>`;
}

export function renderRegister() {
  populateFilters();

  const query = (document.getElementById('registerSearch')?.value || '').toLowerCase().trim();
  const entityFilter = document.getElementById('registerEntityFilter')?.value || '';
  const typeFilter = document.getElementById('registerTypeFilter')?.value || '';

  let rows = getRegisterRows();
  if (entityFilter) rows = rows.filter((r) => r.entityId === entityFilter);
  if (typeFilter) rows = rows.filter((r) => r.docType === typeFilter);
  if (query) {
    rows = rows.filter((r) =>
      [r.id, r.fileName, r.entityName, r.formType, r.period, r.docType]
        .some((v) => String(v).toLowerCase().includes(query)));
  }

  document.getElementById('registerCount').textContent =
    `${rows.length} controlled document${rows.length === 1 ? '' : 's'}`;

  const tbody = document.getElementById('registerTbody');
  tbody.innerHTML = rows.length
    ? rows.map(rowHtml).join('')
    : '<tr><td colspan="7" class="p-8 text-center text-slate-500">No controlled documents match the current filters.</td></tr>';
}
