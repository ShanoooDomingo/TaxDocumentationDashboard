// View controller: owns which top-level view is shown (Filing Tracker vs.
// Document Register) and the single re-render path used after any data change.

import { renderSidebarForms } from './sidebar.js';
import { refreshUI } from './render.js';
import { renderRegister } from './registerView.js';
import { syncRegister } from './register.js';

let currentView = 'tracker';

export function getView() { return currentView; }

export function setView(view) {
  currentView = view;
  const isRegister = view === 'register';

  document.getElementById('trackerView').classList.toggle('hidden', isRegister);
  document.getElementById('registerView').classList.toggle('hidden', !isRegister);

  const registerBtn = document.getElementById('navRegisterBtn');
  registerBtn?.classList.toggle('bg-blue-600', isRegister);
  registerBtn?.classList.toggle('text-white', isRegister);

  refreshActiveView();
}

export function refreshActiveView() {
  if (currentView === 'register') renderRegister();
  else refreshUI();
}

// Single entry point after any persisted change: keep controlled IDs in sync,
// refresh the sidebar form list, and re-render whichever view is visible.
export function notifyChange() {
  syncRegister();
  renderSidebarForms();
  refreshActiveView();
}
