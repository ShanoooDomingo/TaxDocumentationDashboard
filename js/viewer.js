// In-app file preview modal.

import { sessionFileStore } from './store.js';

export function openViewer(fileName) {
  const modal = document.getElementById('fileViewerModal');
  const frame = document.getElementById('viewerFrame');
  const placeholder = document.getElementById('viewerPlaceholder');

  document.getElementById('viewerTitle').textContent = fileName;
  modal.classList.remove('hidden');

  const data = sessionFileStore[fileName];
  if (data) {
    frame.src = data;
    frame.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    // File was uploaded in a previous session (only its name persisted).
    frame.src = '';
    frame.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

export function closeViewer() {
  document.getElementById('fileViewerModal').classList.add('hidden');
  document.getElementById('viewerFrame').src = '';
}
