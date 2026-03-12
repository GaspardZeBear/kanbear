import { DatabaseSync } from 'node:sqlite';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Chemin vers la base de données SQLite
const dbFile = path.join(__dirname, '../kanban.db');

//--------------------------------------------------------------
// Db class is a wrapper around db exported) 
// All code in model is based on sqlite3 module.
// As we use node:sqlite, Db is a wrapper that transform sqlite3 call to node:sqlite
// Avoids to rewrite all models methods
//--------------------------------------------------------------------------
class Db {

    constructor(dbFile) {
        this.db=new DatabaseSync(dbFile);
    }

    //------------------------------------------------------------------------------
    // wraps native db.all() sqlite3 methods
    all(sql,parms,callback) {
        console.log("Db.all()",sql, parms,callback)
        const stmt = this.db.prepare(sql,[])
        const res=stmt.all()
        console.log("Db.all() res",res)
        callback(null,res)
    }
}
//------------------------------------------------------------------------------------------
const db=new Db(dbFile)
export {db } 
//export const db = new DatabaseSync(dbFile, { readonly: true });


