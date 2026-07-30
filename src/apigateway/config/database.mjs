//import { DatabaseSync } from 'node:sqlite';
import Database from 'better-sqlite3';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
//import { Konsol } from '../classes/Konsol.mjs'
import { Konsol } from 'konsol'

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
        //this.db = new DatabaseSync(dbFile);
        //this.db = new Database(dbFile, { verbose: console.log });
        this.db = new Database(dbFile)
    }

    //------------------------------------------------------------------------------
    // wraps native db.all() sqlite3 methods
    all(sql, parms, callAfterAll) {
        Konsol.log("Db.all() <sql>", sql, "<parms>", parms, "<callAfterAll>", callAfterAll)
        const stmt = this.db.prepare(sql, [])
        //console.log("Db.run() <expandeSql>", stmt.expandedSQL)
        const res = stmt.all(parms)
        //Konsol.log("Db.all() over <res>",res)
        callAfterAll(null, 200, res)
    }

    //------------------------------------------------------------------------------
    // wraps native db.get() sqlite3 methods
    get(sql, id, callAfterGet) {
        Konsol.log("Db.get() <sql>", sql, "<id>", id, "<callAfterGet>", callAfterGet)
        const stmt = this.db.prepare(sql)
        //console.log("Db.run() <expandeSql>", stmt.expandedSQL)
        const res = stmt.get(id)
        //Konsol.log("Db.get() <res>", res)
        callAfterGet(null, 200, res)
    }
    //------------------------------------------------------------------------------
    // wraps native run() sqlite3 methods
    run(sql, parms, callAfterRun) {
        Konsol.log("Db.run() <sql>", sql, "<parms>", parms, "<callAfterRun>", callAfterRun)
        try {
            const stmt = this.db.prepare(sql, [])
            const res = stmt.run(...parms)
            //Konsol.log("Db.run() res", res)
            //Konsol.log("Db.run() calling callback")
            callAfterRun(res, 200, callAfterRun)
        } catch (error) {
            Konsol.log("Db.run() exception ", error)
            //callAfterRun({ message: "Error see log" })
            callAfterRun({ message: error },500)
        }
        //return(res)
    }

    //------------------------------------------------------------------------------
    // wraps native run() sqlite3 methods
    exec(sql) {
        Konsol.log("Db.exec() <sql>", sql)
        const stmt = this.db.prepare(sql, [])
        const res = stmt.run()
        //Konsol.log("Db.exec() res", res)

    }


}
//------------------------------------------------------------------------------------------
const db = new Db(dbFile)
export { db }
//export const db = new DatabaseSync(dbFile, { readonly: true });


