// Admin modal for mapping each entity to a Google Drive root folder.

import { getEntities, getFolders, saveFolders } from './store.js';
import { escapeHtml } from './utils.js';

export function openAdminModal() {
  const entities = getEntities();
  const folders = getFolders();
  const container = document.getElementById('adminFolderList');

  container.innerHTML = entities.map((ent) => `
    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
      <label class="font-bold text-slate-800 text-sm flex items-center gap-2" for="folder_${escapeHtml(ent.id)}">
        <i class="ph ph-buildings text-blue-500"></i> ${escapeHtml(ent.name)}
      </label>
      <input type="text" id="folder_${escapeHtml(ent.id)}" value="${escapeHtml(folders[ent.id] || '')}"
        placeholder="Paste Google Drive Folder URL or ID here..."
        class="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-blue-500 text-sm bg-white">
    </div>
  `).join('');

  document.getElementById('adminFolderModal').classList.remove('hidden');
}

export function closeAdminModal() {
  document.getElementById('adminFolderModal').classList.add('hidden');
}

export function saveAdminFolders() {
  const entities = getEntities();
  const folders = getFolders();

  entities.forEach((ent) => {
    const input = document.getElementById(`folder_${ent.id}`);
    if (input) folders[ent.id] = input.value.trim();
  });

  saveFolders(folders);
  closeAdminModal();
}
