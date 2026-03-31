import { db } from '../config/database.mjs'
import { SqlBuilder } from './SqlBuilder.mjs'

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
        db.run(sql, bindVariables, (res) => {
            console.log("UnifiedModel.create(), will call callback <res>", res)
            //res.lastInsertRowid ? callback(null, 201,res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid ? callback(null, 201,res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static getAll(table, req, opParms, callback) {
        
        const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req)
        //const sql = `SELECT * FROM ${table}`;
        console.log("UnifiedModel.getAll(), <table>",table,"<req.query>", req.query,"<sql>",sql)
        db.all(sql, bindVariables, callback);
    }

    //------------------------------------------------------------------
    static getById(table, req, opParms, callback) {
        console.log("UnifiedModel.getById(), <params>", req.params, "<body>", req.body)
        // const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req.params["id"], req.body)
        const sql = `SELECT * FROM ${table} WHERE id = ${req.params["id"]}`;
        db.get(sql, [], callback);
    }

        //------------------------------------------------------------------
    static getByForeignKey(table, req, opParms, callback) {
        console.log("UnifiedModel.getByForeignKey(), <params>", req.params, "<opParms>",opParms,"<body>", req.body)
        //const sql = `SELECT * FROM ${table} WHERE id = ?`;
        //db.get(sql, params["id"], callback);
        // By convention, foreign key name on table xxx is xxx_id !
        const id=`${opParms['foreignKey'].slice(0,-3)}Id`
        console.log("id",id)
        console.log("params[id]",req.params[id])
        const sql = `SELECT * FROM ${table} WHERE ${opParms['foreignKey']} = ? ORDER BY ${opParms['sortColumn']}`;
        db.all(sql, req.params[id], callback);
    }

    //------------------------------------------------------------------
    static update(table, req, opParms, callback) {
        console.log("UnifiedModel.update(), <params>", req.params, "<body>", req.body)
        //const sql = `UPDATE ${table} SET name = ?, is_open = ? WHERE id = ?`;
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, req.params["id"], req.body)
        db.run(sql, bindVariables, (res) => {
            console.log("UnifiedModel.update() onRes fired, will call callback res=", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 200, res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static patch(table, req, opParms, callback) {
        // const { name, is_open } = workspace;
        console.log("UnifiedModel.patch(), <params>", req.params, "<body>", req.body)
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, req.params["id"], req.body)
        db.run(sql, bindVariables, (res) => {
            console.log("UnifiedModel.patch() fired, will call callback res=", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 200, res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static delete(table, req, opParms, callback) {
        console.log("UnifiedModel.delete(), <params>",req.params,"<body>",req.body)
        //const sql = `DELETE FROM ${table} WHERE id = ${req.params["id"]}`;
        const { sql, bindVariables } = new SqlBuilder().generateDeleteStatement(table, req)
        db.run(sql, [], (res) => {
            console.log("UnifiedModel.delete()  fired, will call callback res=", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 204, res) : callback(res, 500, null)
        });
    }
}




export { UnifiedModel } 