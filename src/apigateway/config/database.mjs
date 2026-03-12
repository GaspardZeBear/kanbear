import { DatabaseSync } from 'node:sqlite';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Chemin vers la base de données SQLite
const dbFile = path.join(__dirname, '../kanban.db');

// Initialiser la base de données
export const db = new DatabaseSync(dbFile);
//export const db = new DatabaseSync(dbFile, { readonly: true });


