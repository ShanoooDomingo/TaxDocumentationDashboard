// Entry point: seeds storage, wires event delegation, and boots the UI.

import { seedIfEmpty, onChange, clearDatabase } from './store.js';
import { renderSidebarForms, toggleSidebarMenu, setFormFilter } from './sidebar.js';
import { openAdminModal, closeAdminModal, saveAdminFolders } from './admin.js';
import { openViewer, closeViewer } from './viewer.js';
import {
  updateSelectorOptions, addNewEntity, triggerEntityCorUpload,
  processEntityCorUpload, removeEntityCertificate,
} from './entities.js';
import {
  addBIRTaxReturnForm, addRequirement, updateField, editMetadata,
  toggleAttachmentReq, deletePackage, handleGlobalUpload,
  triggerCellUpload, processCellUpload,
} from './packages.js';
import { setActiveFilter } from './filter.js';
import { setView, notifyChange, refreshActiveView } from './view.js';
import { renderRegister } from './registerView.js';

// Switching to the tracker also keeps the filter submenu open for context.
function showTracker() { toggleSidebarMenu(); setView('tracker'); }
function showTrackerAnd(fn) { return () => { setView('tracker'); fn(); }; }

// Map data-action values to handlers. Each receives the element's dataset.
const ACTIONS = {
  'open-admin': openAdminModal,
  'close-admin': closeAdminModal,
  'save-admin': saveAdminFolders,
  'close-viewer': closeViewer,
  'toggle-sidebar': showTracker,
  'show-register': () => setView('register'),
  'add-bir-form': showTrackerAnd(addBIRTaxReturnForm),
  'add-entity': addNewEntity,
  'add-requirement': showTrackerAnd(addRequirement),
  'reset-db': handleResetDb,
  'select-files': () => document.getElementById('fileInput').click(),
  'trigger-cor-upload': triggerEntityCorUpload,
  'remove-cor': removeEntityCertificate,
  'set-filter': (d) => { setView('tracker'); setFormFilter(d.form); },
  'open-viewer': (d) => openViewer(d.file),
  'clear-field': (d) => updateField(d.pkg, d.field, ''),
  'trigger-cell-upload': (d) => triggerCellUpload(d.pkg, d.field, d.accept),
  'edit-metadata': (d) => editMetadata(d.pkg, d.field),
  'toggle-attachment': (d) => toggleAttachmentReq(d.pkg),
  'delete-package': (d) => deletePackage(d.pkg),
};

function handleResetDb() {
  if (!confirm('Warning: This deletes ALL records and settings. Continue?')) return;
  clearDatabase();
  location.reload();
}

function onDelegatedClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const handler = ACTIONS[el.dataset.action];
  if (handler) handler(el.dataset, event);
}

function setupDropzone() {
  const dz = document.getElementById('dropzone');
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((evt) => dz.addEventListener(evt, stop));
  ['dragenter', 'dragover'].forEach((evt) => dz.addEventListener(evt, () => dz.classList.add('drag-active')));
  ['dragleave', 'drop'].forEach((evt) => dz.addEventListener(evt, () => dz.classList.remove('drag-active')));
  dz.addEventListener('drop', handleGlobalUpload);
}

function setupModalDismiss() {
  // Click the dimmed backdrop or press Escape to close either modal.
  ['adminFolderModal', 'fileViewerModal'].forEach((id) => {
    const modal = document.getElementById(id);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAdminModal();
    closeViewer();
  });
}

function setupRegisterControls() {
  ['registerSearch', 'registerEntityFilter', 'registerTypeFilter'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', renderRegister);
    el.addEventListener('change', renderRegister);
  });
}

function initApp() {
  seedIfEmpty();

  // Re-render the active view (and refresh controlled IDs) on any data change.
  onChange(notifyChange);

  updateSelectorOptions();

  document.body.addEventListener('click', onDelegatedClick);
  document.getElementById('companySelector').addEventListener('change', () => {
    setActiveFilter('All');
    renderSidebarForms();
    refreshActiveView();
  });
  document.getElementById('fileInput').addEventListener('change', handleGlobalUpload);
  document.getElementById('cellFileInput').addEventListener('change', processCellUpload);
  document.getElementById('entityCorInput').addEventListener('change', processEntityCorUpload);

  setupDropzone();
  setupModalDismiss();
  setupRegisterControls();

  document.getElementById('matrixChevron').classList.add('rotate-180');
  renderSidebarForms();
  notifyChange(); // initial register sync + first render
}

initApp();
