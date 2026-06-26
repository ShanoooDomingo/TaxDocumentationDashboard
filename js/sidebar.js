// Sidebar: collapsible menu plus the dynamic per-form-type filter buttons.

import { getPackages } from './store.js';
import { escapeHtml } from './utils.js';
import { getActiveFilter, setActiveFilter } from './filter.js';
import { refreshUI } from './render.js';

let isMenuOpen = true;

export function toggleSidebarMenu() {
  isMenuOpen = !isMenuOpen;
  const menu = document.getElementById('matrixSubMenu');
  const chevron = document.getElementById('matrixChevron');
  menu.classList.toggle('hidden', !isMenuOpen);
  chevron.classList.toggle('rotate-180', isMenuOpen);
}

export function renderSidebarForms() {
  const active = getActiveFilter();
  const uniqueForms = [...new Set(getPackages().map((p) => p.formType))]
    .filter((f) => f && f.trim() !== '');

  const button = (form, label) => {
    const isActive = active === form;
    const cls = isActive
      ? 'bg-slate-800 text-white font-bold'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800';
    const icon = form === 'All'
      ? ''
      : '<i class="ph ph-file-dashed text-slate-500 mr-2 inline-block relative top-0.5"></i>';
    return `<button data-action="set-filter" data-form="${escapeHtml(form)}"
      class="w-full text-left px-4 py-2 text-sm rounded-lg truncate transition-colors ${cls}"
      title="${escapeHtml(label)}">${icon}${escapeHtml(label)}</button>`;
  };

  const html = [button('All', 'All Forms'), ...uniqueForms.map((f) => button(f, f))].join('');

  document.getElementById('matrixSubMenu').innerHTML = html;
  document.getElementById('filterLabel').textContent = active === 'All' ? 'All Forms' : active;
}

export function setFormFilter(formName) {
  setActiveFilter(formName);
  renderSidebarForms();
  refreshUI();
}
