// Entity (company) management: the header selector, adding entities, and the
// per-entity BIR Certificate of Registration upload.

import { getEntities, saveEntities, sessionFileStore } from './store.js';
import { generateId, readFileAsDataURL } from './utils.js';
import { setActiveFilter } from './filter.js';
import { notifyChange } from './view.js';

const selector = () => document.getElementById('companySelector');

export function getActiveEntityId() { return selector().value; }

export function updateSelectorOptions(selectedId = null) {
  const entities = getEntities();
  selector().innerHTML = entities
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join('');
  if (selectedId) selector().value = selectedId;
}

export function addNewEntity() {
  const newName = prompt('Enter the name of the new Entity:');
  if (!newName || newName.trim() === '') return;

  const ents = getEntities();
  const newId = generateId('C');
  ents.push({ id: newId, name: newName.trim(), corFile: '' });
  saveEntities(ents);

  updateSelectorOptions(newId);
  setActiveFilter('All');
  notifyChange();
}

export function triggerEntityCorUpload() {
  document.getElementById('entityCorInput').click();
}

export async function processEntityCorUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    sessionFileStore[file.name] = await readFileAsDataURL(file);
    const ents = getEntities();
    const index = ents.findIndex((ent) => ent.id === getActiveEntityId());
    if (index > -1) {
      ents[index].corFile = file.name;
      saveEntities(ents);
      notifyChange();
    }
  } catch (err) {
    console.error('Failed to read certificate file', err);
    alert('Could not read that file. Please try again.');
  } finally {
    event.target.value = '';
  }
}

export function removeEntityCertificate() {
  if (!confirm('Remove the BIR Certificate of Registration from this active entity?')) return;

  const ents = getEntities();
  const index = ents.findIndex((ent) => ent.id === getActiveEntityId());
  if (index > -1) {
    ents[index].corFile = '';
    saveEntities(ents);
    notifyChange();
  }
}
