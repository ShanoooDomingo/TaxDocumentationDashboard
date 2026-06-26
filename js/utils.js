// Small pure helpers shared across modules.

// Collision-free id. The original used `Date.now()`, which repeats when two
// rows are created inside the same millisecond (e.g. a multi-file drop).
export function generateId(prefix = 'id') {
  const rand = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, '');
  return `${prefix}_${Date.now().toString(36)}_${rand.slice(0, 8)}`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

// Read a File into a persistent data URL so the in-app viewer keeps working
// for the whole session (object URLs are released on reload and can't be
// re-resolved). Returns a Promise to keep callers async and predictable.
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
