// All DOM rendering for the main panel: header certificate, stat cards, and
// the compliance table. Handlers are attached via data-action attributes and
// resolved by the delegated listener in main.js.

import { getEntities, getPackages } from './store.js';
import { evaluateStatus, isComplete } from './status.js';
import { escapeHtml } from './utils.js';
import { getActiveFilter } from './filter.js';
import { getActiveEntityId } from './entities.js';
import { getDocId, docKey } from './register.js';

// Small controlled-id badge shown beneath a file name, linking the cell to its
// Document Register entry.
function docIdBadge(key) {
  const id = getDocId(key);
  return id ? `<div class="text-[9px] font-mono text-slate-400 mt-0.5" title="Document Control Number">${escapeHtml(id)}</div>` : '';
}

function renderFileCell(pkgId, field, value, icon, acceptTypes) {
  const id = escapeHtml(pkgId);
  const f = escapeHtml(field);
  if (value) {
    const safe = escapeHtml(value);
    return `
      <div class="flex items-center justify-center gap-1 group relative">
        <i class="ph ${icon} text-xl text-blue-500"></i>
        <div class="min-w-0">
          <button data-action="open-viewer" data-file="${safe}"
            class="truncate w-24 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left block"
            title="Click to view ${safe}">${safe}</button>
          ${docIdBadge(docKey(pkgId, field))}
        </div>
        <button data-action="clear-field" data-pkg="${id}" data-field="${f}"
          class="absolute -top-2 -right-2 text-slate-400 hover:text-red-500 hidden group-hover:block bg-white rounded-full">
          <i class="ph-fill ph-x-circle text-base"></i>
        </button>
      </div>`;
  }
  return `
    <button data-action="trigger-cell-upload" data-pkg="${id}" data-field="${f}" data-accept="${escapeHtml(acceptTypes)}"
      class="text-slate-400 hover:text-blue-500 border border-dashed border-slate-300 hover:border-blue-500 rounded p-1 text-xs w-full transition-colors flex justify-center items-center gap-1">
      <i class="ph ph-upload-simple"></i> Upload
    </button>`;
}

export function renderEntityCertificate(activeEntity) {
  const container = document.getElementById('entityCorContent');
  if (!container || !activeEntity) return;

  if (activeEntity.corFile) {
    const safe = escapeHtml(activeEntity.corFile);
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button data-action="open-viewer" data-file="${safe}"
          class="group flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-400 px-2.5 py-1.5 text-left transition-all shadow-sm max-w-[260px]"
          title="Click to expand ${safe}">
          <div class="w-8 h-10 bg-white border border-indigo-200 rounded-md flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <span class="text-[9px] font-black text-indigo-600 leading-none">BIR</span>
            <span class="text-[9px] font-black text-indigo-600 leading-none">COR</span>
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-indigo-700 leading-tight">Certificate of Registration</p>
            <p class="text-[10px] text-slate-500 truncate max-w-[180px]">${safe}</p>
            ${docIdBadge(`cor::${activeEntity.id}`)}
          </div>
        </button>
        <button data-action="remove-cor" class="text-slate-400 hover:text-red-500" title="Remove certificate from this entity">
          <i class="ph-fill ph-x-circle text-base"></i>
        </button>
      </div>`;
  } else {
    container.innerHTML = `
      <button data-action="trigger-cor-upload"
        class="group flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50 px-2.5 py-1.5 text-left transition-colors">
        <div class="w-8 h-10 border border-dashed border-indigo-300 rounded-md flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-500">
          <span class="text-[9px] font-black text-indigo-500 leading-none">BIR</span>
          <span class="text-[9px] font-black text-indigo-500 leading-none">COR</span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-indigo-600 leading-tight">Upload COR</p>
          <p class="text-[10px] text-slate-400">PDF or image</p>
        </div>
      </button>`;
  }
}

function renderRow(pkg) {
  const status = evaluateStatus(pkg);
  const id = escapeHtml(pkg.id);
  const attachmentCell = pkg.requiresAttachment
    ? renderFileCell(pkg.id, 'attachment', pkg.attachment, 'ph-file-csv', '.dat,.csv')
    : '<span class="text-xs text-slate-300">N/A</span>';
  const eSubCell = pkg.requiresAttachment
    ? renderFileCell(pkg.id, 'eSubReply', pkg.eSubReply, 'ph-file-pdf', 'application/pdf')
    : '<span class="text-xs text-slate-300">N/A</span>';

  return `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4">
        <div class="font-bold text-slate-800 cursor-pointer hover:text-blue-600" data-action="edit-metadata" data-pkg="${id}" data-field="period" title="Click to edit">${escapeHtml(pkg.period)}</div>
        <div class="text-xs text-slate-500 cursor-pointer hover:text-blue-600" data-action="edit-metadata" data-pkg="${id}" data-field="formType" title="Click to edit">${escapeHtml(pkg.formType)}</div>
        <div class="mt-1 flex items-center gap-2">
          <button data-action="toggle-attachment" data-pkg="${id}" class="text-[10px] uppercase font-bold ${pkg.requiresAttachment ? 'text-blue-500' : 'text-slate-300'} hover:text-blue-700">
            ${pkg.requiresAttachment ? 'W/ ATTACHMENT' : 'NO ATTACHMENT'}
          </button>
          <span class="text-slate-300">|</span>
          <button data-action="delete-package" data-pkg="${id}" class="text-[10px] uppercase text-red-400 hover:text-red-600 font-bold">Delete</button>
        </div>
      </td>
      <td class="px-4 py-4 text-center border-l border-slate-100">${renderFileCell(pkg.id, 'mainForm', pkg.mainForm, 'ph-file-pdf', 'application/pdf')}</td>
      <td class="px-4 py-4 text-center border-l border-slate-100 bg-amber-50/30">${renderFileCell(pkg.id, 'refFile', pkg.refFile, 'ph-file-pdf', 'application/pdf')}</td>
      <td class="px-4 py-4 text-center border-l border-slate-100 bg-purple-50/30">${renderFileCell(pkg.id, 'paymentFile', pkg.paymentFile, 'ph-receipt', 'application/pdf,image/*')}</td>
      <td class="px-4 py-4 text-center border-l border-slate-100">${attachmentCell}</td>
      <td class="px-4 py-4 text-center border-l border-slate-100">${eSubCell}</td>
      <td class="px-6 py-4 text-center border-l border-slate-100">
        <span class="px-2 py-1.5 rounded text-xs font-semibold border inline-block w-full text-center ${status.color}">${status.text}</span>
      </td>
    </tr>`;
}

export function refreshUI() {
  const activeId = getActiveEntityId();
  const activeEntity = getEntities().find((c) => c.id === activeId);
  if (!activeEntity) return;

  document.getElementById('dropzoneEntity').textContent = activeEntity.name;
  renderEntityCertificate(activeEntity);

  const activeFilter = getActiveFilter();
  let pkgs = getPackages().filter((p) => p.companyId === activeId);
  if (activeFilter !== 'All') {
    pkgs = pkgs.filter((p) => p.formType === activeFilter);
  }

  document.getElementById('statTotal').textContent = pkgs.length;
  document.getElementById('statPending').textContent = pkgs.filter((p) => !isComplete(p)).length;
  document.getElementById('statCompleted').textContent = pkgs.filter((p) => isComplete(p)).length;

  const tbody = document.getElementById('tableBody');
  if (pkgs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">No filing requirements matched for <b>${escapeHtml(activeEntity.name)}</b>.</td></tr>`;
    return;
  }

  tbody.innerHTML = pkgs.map(renderRow).join('');
}
