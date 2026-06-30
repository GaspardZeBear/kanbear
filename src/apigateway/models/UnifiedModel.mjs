import { db } from '../config/database.mjs'
import { SqlBuilder } from './SqlBuilder.mjs'
import { Konsol } from '../classes/Konsol.mjs'

class UnifiedModel {

//------------------------------------------------------------------------
// Class to avoid having lots of individual models that have the same look
// Setup in UnifiedController
// params : params in the URL (ex :1 values in http://xx.yy/:1 )
// body : body of the request, json format with fileds (columns !) values
// Note : depending on the op: 
//   -- id often in params, not always required
//   -- body not always required
//
// db is the db wrapper for sqlite api
// ------------------------------------------------------------------------

    static UnifiedModelOp = {}
    static {
        UnifiedModel.UnifiedModelOp['create'] = UnifiedModel.create
        UnifiedModel.UnifiedModelOp['getAll'] = UnifiedModel.getAll
        UnifiedModel.UnifiedModelOp['getById'] = UnifiedModel.getById
        UnifiedModel.UnifiedModelOp['getByForeignKey'] = UnifiedModel.getByForeignKey
        UnifiedModel.UnifiedModelOp['update'] = UnifiedModel.update
        UnifiedModel.UnifiedModelOp['patch'] = UnifiedModel.patch
        UnifiedModel.UnifiedModelOp['delete'] = UnifiedModel.delete
    }

    //------------------------------------------------------------------
    static create(table, req, opParms, callback) {
        const { sql, bindVariables } = new SqlBuilder().generateCreateStatement(table, req.body)
        db.run(sql, bindVariables, (res, httpCode) => {
            Konsol.log("UnifiedModel.create(), will call callback","<res>", res)
            //res.lastInsertRowid ? callback(null, 201,res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid ? callback(null, 201,res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static getAll(table, req, opParms, callback) {
        
        const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req)
        //const sql = `SELECT * FROM ${table}`;
        Konsol.log("UnifiedModel.getAll()","<table>",table,"<req.query>", req.query,"<sql>",sql)
        //console.log("UnifiedModel.getAll()XXXXX, <table>",table,"<req query>", req.query,"<sql>",sql)
        db.all(sql, bindVariables, callback);
    }

    //------------------------------------------------------------------
    static getById(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.getById()","<params>", req.params, "<body>", req.body)
        // const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req.params["id"], req.body)
        const sql = `SELECT * FROM ${table} WHERE id = ${req.params["id"]}`;
        db.get(sql, [], callback);
    }

    //------------------------------------------------------------------
    static getByForeignKey(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.getByForeignKey()","<params>", req.params, "<opParms>",opParms,"<body>", req.body)

        // Let's asssume for now that req.params contains the foreign keys
        // Maybe  in req. body one day!
        let wheres=[]
          Object.entries(req.params).forEach(([key, val]) => {
            wheres.push(`${key}=${val}`)
  
        })
        const where=wheres.join(' AND ')
        const sql = `SELECT * FROM ${table} WHERE ${where}`;
        db.all(sql, [] , callback);
    }

    //------------------------------------------------------------------
    static update(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.update()","<params>", req.params, "<body>", req.body)
        //const sql = `UPDATE ${table} SET name = ?, is_open = ? WHERE id = ?`;
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, req.params["id"], req.body)
        db.run(sql, bindVariables, (res) => {
            Konsol.log("UnifiedModel.update() onRes fired, will call callback","<res>", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 200, res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static patch(table, req, opParms, callback) {
        // const { name, is_open } = workspace;
        Konsol.log("UnifiedModel.patch(), <params>", req.params, "<body>", req.body)
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, req.params["id"], req.body)
        db.run(sql, bindVariables, (res) => {
            Konsol.log("UnifiedModel.patch() fired, will call callback","<res>", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 200, res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static delete(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.delete(), <params>",req.params,"<body>",req.body)
        //const sql = `DELETE FROM ${table} WHERE id = ${req.params["id"]}`;
        const { sql, bindVariables } = new SqlBuilder().generateDeleteStatement(table, req)
        db.run(sql, [], (res) => {
            Konsol.log("UnifiedModel.delete()  fired, will call callback","<res>", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 204, res) : callback(res, 500, null)
        });
    }
}




export { UnifiedModel } 