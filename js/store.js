// Single source of truth for persisted state. Everything that touches
// localStorage or the in-memory file cache goes through here.

import { DB_KEYS, PACKAGE_FIELDS, SEED_ENTITIES, SEED_PACKAGES } from './config.js';

// Base64/data-URL contents of files uploaded this session, keyed by file name.
export const sessionFileStore = {};

// Resilient JSON read: a corrupt or partially written value should fall back
// to the default instead of throwing and white-screening the app.
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Resetting unreadable storage key "${key}"`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// One callback fired whenever packages change, so the store stays decoupled
// from the rendering layer (no circular imports).
let onPackagesChanged = () => {};
export function onChange(fn) { onPackagesChanged = fn; }

export function seedIfEmpty() {
  if (localStorage.getItem(DB_KEYS.ENTS) === null) writeJSON(DB_KEYS.ENTS, SEED_ENTITIES);
  if (localStorage.getItem(DB_KEYS.FOLDERS) === null) writeJSON(DB_KEYS.FOLDERS, {});
  if (localStorage.getItem(DB_KEYS.PKGS) === null) writeJSON(DB_KEYS.PKGS, SEED_PACKAGES);
  if (localStorage.getItem(DB_KEYS.DOCS) === null) writeJSON(DB_KEYS.DOCS, { seq: 0, items: {} });
}

// --- Entities ---
export function getEntities() {
  return readJSON(DB_KEYS.ENTS, []).map((ent) => ({ corFile: '', ...ent }));
}
export function saveEntities(ents) { writeJSON(DB_KEYS.ENTS, ents); }

// --- Admin folder mappings ---
export function getFolders() { return readJSON(DB_KEYS.FOLDERS, {}); }
export function saveFolders(folders) { writeJSON(DB_KEYS.FOLDERS, folders); }

// --- Packages ---
export function getPackages() {
  return readJSON(DB_KEYS.PKGS, []).map((pkg) => ({ ...PACKAGE_FIELDS, ...pkg }));
}
export function savePackages(pkgs) {
  writeJSON(DB_KEYS.PKGS, pkgs);
  onPackagesChanged();
}

// --- Document register (controlled-id ledger) ---
// `seq` only ever increments so a number is never reused; `items` is keyed by
// a stable document key (see documents.js).
export function getDocStore() { return readJSON(DB_KEYS.DOCS, { seq: 0, items: {} }); }
export function saveDocStore(store) { writeJSON(DB_KEYS.DOCS, store); }

export function clearDatabase() {
  Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
}
