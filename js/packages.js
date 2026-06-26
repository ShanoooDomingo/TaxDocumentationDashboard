// Filing package (table row) operations and the upload flows that feed them.

import { getPackages, savePackages, sessionFileStore } from './store.js';
import { generateId, readFileAsDataURL } from './utils.js';
import { setActiveFilter } from './filter.js';
import { getActiveEntityId } from './entities.js';

function newPackage(overrides = {}) {
  return {
    id: generateId('pkg'),
    companyId: getActiveEntityId(),
    period: 'Click to Edit Period',
    formType: 'Click to Edit Form',
    requiresAttachment: true,
    mainForm: '', refFile: '', paymentFile: '', attachment: '', eSubReply: '',
    ...overrides,
  };
}

export function addBIRTaxReturnForm() {
  const formInput = prompt('Enter the BIR Tax Return Form code or name (example: 1702Q, 2550Q, 1601C):');
  if (!formInput || formInput.trim() === '') return;

  const formType = formInput.trim();
  const periodInput = prompt('Enter the tax period for this form (example: Q2 2026, Jan 2026):', 'Click to Edit Period');
  const period = periodInput && periodInput.trim() !== '' ? periodInput.trim() : 'Click to Edit Period';
  const requiresAttachment = confirm('Does this BIR form require SLSP/QAP/eSub attachments?');

  const pkgs = getPackages();
  pkgs.push(newPackage({ period, formType, requiresAttachment }));
  setActiveFilter(formType);
  savePackages(pkgs);
}

export function addRequirement() {
  const pkgs = getPackages();
  pkgs.push(newPackage());
  savePackages(pkgs);
}

export function updateField(pkgId, field, value) {
  const pkgs = getPackages();
  const index = pkgs.findIndex((p) => p.id === pkgId);
  if (index > -1) {
    pkgs[index][field] = value;
    savePackages(pkgs);
  }
}

export function editMetadata(pkgId, field) {
  const pkgs = getPackages();
  const index = pkgs.findIndex((p) => p.id === pkgId);
  if (index === -1) return;
  const newVal = prompt('Edit value:', pkgs[index][field]);
  if (newVal !== null && newVal.trim() !== '') {
    pkgs[index][field] = newVal.trim();
    savePackages(pkgs);
  }
}

export function toggleAttachmentReq(pkgId) {
  const pkgs = getPackages();
  const index = pkgs.findIndex((p) => p.id === pkgId);
  if (index > -1) {
    pkgs[index].requiresAttachment = !pkgs[index].requiresAttachment;
    savePackages(pkgs);
  }
}

export function deletePackage(pkgId) {
  if (!confirm('Delete this entire row?')) return;
  savePackages(getPackages().filter((p) => p.id !== pkgId));
}

// --- Uploads ---

export async function handleGlobalUpload(event) {
  const files = Array.from(event.target?.files || event.dataTransfer?.files || []);
  if (files.length === 0) return;

  try {
    const pkgs = getPackages();
    const companyId = getActiveEntityId();
    for (const file of files) {
      sessionFileStore[file.name] = await readFileAsDataURL(file);
      pkgs.push(newPackage({
        companyId,
        period: 'New Period',
        formType: 'Unassigned Form',
        mainForm: file.name,
      }));
    }
    savePackages(pkgs);
  } catch (err) {
    console.error('Failed to read uploaded file', err);
    alert('One or more files could not be read. Please try again.');
  } finally {
    const input = document.getElementById('fileInput');
    if (input) input.value = '';
  }
}

let pendingUploadTarget = { pkgId: null, field: null };

export function triggerCellUpload(pkgId, field, acceptTypes) {
  pendingUploadTarget = { pkgId, field };
  const input = document.getElementById('cellFileInput');
  input.accept = acceptTypes;
  input.click();
}

export async function processCellUpload(event) {
  const file = event.target.files[0];
  if (!file || !pendingUploadTarget.pkgId) return;

  try {
    sessionFileStore[file.name] = await readFileAsDataURL(file);
    updateField(pendingUploadTarget.pkgId, pendingUploadTarget.field, file.name);
  } catch (err) {
    console.error('Failed to read uploaded file', err);
    alert('That file could not be read. Please try again.');
  } finally {
    event.target.value = '';
    pendingUploadTarget = { pkgId: null, field: null };
  }
}
