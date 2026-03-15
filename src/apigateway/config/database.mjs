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
    all(sql,parms,callAfterAll) {
        console.log("Db.all() <sql>",sql, "<parms>",parms,"<callAfterAll>",callAfterAll)
        const stmt = this.db.prepare(sql,[])
        console.log("Db.run() <expandeSql>",stmt.expandedSQL)
        const res=stmt.all()
        console.log("Db.all() over <res>",'res')
        callAfterAll(null,200,res)
    }

    //------------------------------------------------------------------------------
    // wraps native db.get() sqlite3 methods
    get(sql,id,callAfterGet) {
        console.log("Db.get() <sql>",sql,"<id>",id,"<callAfterGet>",callAfterGet)
        const stmt = this.db.prepare(sql)
        console.log("Db.run() <expandeSql>",stmt.expandedSQL)
        const res=stmt.get(id)
        console.log("Db.get() <res>",res)
        callAfterGet(null,200,res)
    }
    //------------------------------------------------------------------------------
    // wraps native run() sqlite3 methods
    run(sql,parms,callAfterRun) {
        console.log("Db.run() <sql>",sql, "<parms>",parms,"<callAfterRun>",callAfterRun)
        const stmt = this.db.prepare(sql,[])
        console.log("Db.run() <expandeSql>",stmt.expandedSQL)
        try {
          const res=stmt.run(...parms)
          console.log("Db.run() res",res)
        //res.lastID=res.lastInsertRowid
          console.log("Db.run() calling callback")
          callAfterRun(res, res.lastInsertRowid)
        } catch (error) {
          console.log("Db.run() exception ",error)
          callAfterRun({message: "Error see log"})
        }
        //return(res)
    }


}
//------------------------------------------------------------------------------------------
const db=new Db(dbFile)
export {db } 
//export const db = new DatabaseSync(dbFile, { readonly: true });


