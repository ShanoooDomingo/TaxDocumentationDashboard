// Static configuration: storage keys and seed data for first-run.

export const DB_KEYS = {
  PKGS: 'taxBridgePackagesV6',
  ENTS: 'taxBridgeEntitiesV6',
  FOLDERS: 'taxBridgeFoldersV6', // { companyId: "gDriveFolderID" }
  DOCS: 'taxBridgeDocRegisterV6', // { seq, items: { key: { id, fileName, createdAt } } }
};

// Prefix and width for controlled Document Control Numbers (DCN-0001, ...).
export const DOC_ID_PREFIX = 'DCN-';
export const DOC_ID_WIDTH = 4;

// The file-bearing package fields, in register/column order, with the
// human-readable document type each one represents.
export const DOCUMENT_TYPES = [
  { field: 'mainForm', label: 'Tax Return' },
  { field: 'refFile', label: 'Filing Reference' },
  { field: 'paymentFile', label: 'Payment Details' },
  { field: 'attachment', label: 'SLSP/QAP' },
  { field: 'eSubReply', label: 'eSub Reply' },
];

// Entity-level Certificate of Registration is also a controlled document, but
// it lives on the entity rather than a package row.
export const COR_DOC_LABEL = 'Certificate of Registration';

// Blank field set shared by every new package row, so a missing key never
// surfaces as `undefined` in the table.
export const PACKAGE_FIELDS = {
  mainForm: '',
  refFile: '',
  paymentFile: '',
  attachment: '',
  eSubReply: '',
};

export const SEED_ENTITIES = [
  { id: 'C001', name: 'Alpha Holdings Corporation', corFile: '' },
  { id: 'C002', name: 'Beta Manufacturing Inc.', corFile: '' },
];

export const SEED_PACKAGES = [
  { id: 'pkg_1', companyId: 'C001', period: 'Q1 2026', formType: '2550Q', requiresAttachment: true, ...PACKAGE_FIELDS },
  { id: 'pkg_2', companyId: 'C001', period: 'Jan 2026', formType: '1601EQ', requiresAttachment: false, ...PACKAGE_FIELDS },
];
