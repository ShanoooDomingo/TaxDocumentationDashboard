// Document register: assigns and maintains stable controlled IDs (DCN-####)
// for every file that exists in the system, across all entities.
//
// Packages and entities remain the source of truth for *which* documents
// exist; this module owns the controlled-id ledger that runs alongside them.

import { getEntities, getPackages, getDocStore, saveDocStore } from './store.js';
import { DOCUMENT_TYPES, COR_DOC_LABEL, DOC_ID_PREFIX, DOC_ID_WIDTH } from './config.js';

// Stable key for a document so its controlled ID survives renames and edits.
export function docKey(pkgId, field) { return `${pkgId}::${field}`; }
const corKey = (entityId) => `cor::${entityId}`;

function formatId(seq) {
  return DOC_ID_PREFIX + String(seq).padStart(DOC_ID_WIDTH, '0');
}

// Every document currently present in the system, with its joinable metadata.
function presentDocuments() {
  const rows = [];

  getPackages().forEach((pkg) => {
    DOCUMENT_TYPES.forEach(({ field, label }) => {
      const fileName = pkg[field];
      if (fileName) {
        rows.push({
          key: docKey(pkg.id, field),
          entityId: pkg.companyId,
          docType: label,
          fileName,
          period: pkg.period,
          formType: pkg.formType,
        });
      }
    });
  });

  getEntities().forEach((ent) => {
    if (ent.corFile) {
      rows.push({
        key: corKey(ent.id),
        entityId: ent.id,
        docType: COR_DOC_LABEL,
        fileName: ent.corFile,
        period: '—',
        formType: '—',
      });
    }
  });

  return rows;
}

// Reconcile the ledger with reality: keep existing IDs/dates, mint new IDs for
// new documents, and drop entries whose document no longer exists. Idempotent,
// so it is safe to call on every data change.
export function syncRegister() {
  const present = presentDocuments();
  const store = getDocStore();
  let { seq } = store;
  const items = {};

  present.forEach((doc) => {
    const existing = store.items?.[doc.key];
    if (existing) {
      items[doc.key] = { id: existing.id, createdAt: existing.createdAt, fileName: doc.fileName };
    } else {
      seq += 1;
      items[doc.key] = { id: formatId(seq), createdAt: Date.now(), fileName: doc.fileName };
    }
  });

  saveDocStore({ seq, items });
}

// Controlled ID for one document key, or null if it has not been minted yet.
export function getDocId(key) {
  return getDocStore().items?.[key]?.id || null;
}

// Full register rows (present documents joined with their ledger entry),
// sorted by controlled ID.
export function getRegisterRows() {
  const store = getDocStore();
  const nameById = Object.fromEntries(getEntities().map((e) => [e.id, e.name]));

  return presentDocuments()
    .map((doc) => {
      const rec = store.items?.[doc.key] || {};
      return {
        ...doc,
        id: rec.id || '—',
        createdAt: rec.createdAt || null,
        entityName: nameById[doc.entityId] || doc.entityId,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
