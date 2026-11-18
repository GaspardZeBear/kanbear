// rightsFlags.mjs
export const REFERENCE = 4, READ = 2, WRITE = 1, DELETE = 8, ADMIN = 16;

// Pilotage unique de l'UI : ordre, libellés fonctions de sauvegarde
export const RIGHT_DEFS = [
  { bit: ADMIN,     key: 'admin',     label: 'isAdmin', flag: ADMIN },
  { bit: DELETE,    key: 'delete',    label: 'Delete',  flag: DELETE },
  { bit: REFERENCE, key: 'reference', label: 'Reference', flag: REFERENCE },
  { bit: READ,      key: 'read',      label: 'Read',    flag: READ },
  { bit: WRITE,     key: 'write',     label: 'Write',   flag: WRITE },
];

export const hasBits = (rights, bit) => (rights & bit) === bit;