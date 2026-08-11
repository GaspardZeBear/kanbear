import { db } from '../config/database.mjs'
import { SqlBuilder } from './SqlBuilder.mjs'
//import { Konsol } from '../classes/Konsol.mjs'
import { Konsol } from 'konsol'
import bcrypt from 'bcrypt'

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
        UnifiedModel.UnifiedModelOp['hashAndCreateUser'] = UnifiedModel.hashAndCreateUser
        UnifiedModel.UnifiedModelOp['getAll'] = UnifiedModel.getAll
        UnifiedModel.UnifiedModelOp['getById'] = UnifiedModel.getById
        UnifiedModel.UnifiedModelOp['getByForeignKey'] = UnifiedModel.getByForeignKey
        UnifiedModel.UnifiedModelOp['getProjectsRightsByUserid'] = UnifiedModel.getProjectsRightsByUserid
        UnifiedModel.UnifiedModelOp['update'] = UnifiedModel.update
        UnifiedModel.UnifiedModelOp['patch'] = UnifiedModel.patch
        UnifiedModel.UnifiedModelOp['delete'] = UnifiedModel.delete
    }

    //------------------------------------------------------------------
    static create(table, req, opParms, callback) {
        const { sql, bindVariables } = new SqlBuilder().generateCreateStatement(table, req.body)
        db.run(sql, bindVariables, (res, httpCode) => {
            Konsol.log("UnifiedModel.create(), will call callback", "<res>", res)
            //res.lastInsertRowid ? callback(null, 201,res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid ? callback(null, 201, res) : callback(res, 500, null)
        });
    }

//------------------------------------------------------------------
    static getProjectsRightsByUserid(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.getProjectsRightsByUserid()", "<params>", req.params)
        Konsol.log("UnifiedModel.getProjectsRightsByUserid()", "<body>", req.body)
        const sql = `SELECT r.id id,
                            r.user_id user_id,
                            r.project_id project_id,
                            r.rights rights,
                            p.name project_name
                        FROM projects_rights as r
                        LEFT JOIN projects as p
                            on p.id=r.project_id
                        WHERE r.user_id = ${req.params["user_id"]}
                        `
                   
        Konsol.log("UnifiedModel.getProjectsRightsByUserid()", "<sql>", sql)
        
        db.all(sql, [], (err, httpCode, res) => {
             Konsol.log("UnifiedModel.getProjectsRightsByUserid()(), will call callback","<res>", err)
            Konsol.log("UnifiedModel.getProjectsRightsByUserid()(), will call callback","<res>", res)
             Konsol.log("UnifiedModel.getProjectsRightsByUserid()(), will call callback","<httpCode>", httpCode)
            //res.lastInsertRowid ? callback(null, 201,res.lastInsertRowid) : callback(res, null)
            callback(null, 200,res)
        });
        
        
       //db.run(sql, [], callback)
    }

    //------------------------------------------------------------------
    static hashAndCreateUser(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.hashAndCreateUser()", "<kanbearKontext>", req.kanbearKontext)
        Konsol.log("UnifiedModel.hashAndCreateUser()", "<passwd>", req.body.password)

        // only user is_admin true can create user
        //let bogusReq = { params: { id: req.kanbearKontext.token.userId } }
        //let admin
        //UnifiedModel.getById('users', bogusReq, {}, (err, httpCode, params) => { admin = params })
        //Konsol.log("UnifiedModel.hashAndCreateUser()", "admin", admin)
        //if (admin.is_admin) {
        //if ( req.kanbearKontext.token.isAdmin ) {
            if ( true ) {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10)
            req.body.password = hashedPassword
            UnifiedModel.create(table, req, opParms, callback)
        } else {
            throw Error("Not admin")
        }
        /*
        const { sql, bindVariables } = new SqlBuilder().generateCreateStatement(table, req.body)
        db.run(sql, bindVariables, (res, httpCode) => {
            Konsol.log("UnifiedModel.hashAndCreateUser(), will call callback","<res>", res)
            //res.lastInsertRowid ? callback(null, 201,res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid ? callback(null, 201,res) : callback(res, 500, null)
        });
        */

    }

    //------------------------------------------------------------------
    static getAll(table, req, opParms, callback) {

        const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req)
        //const sql = `SELECT * FROM ${table}`;
        Konsol.log("UnifiedModel.getAll()", "<table>", table, "<req.query>", req.query, "<sql>", sql)
        //console.log("UnifiedModel.getAll()XXXXX, <table>",table,"<req query>", req.query,"<sql>",sql)
        db.all(sql, bindVariables, callback);
    }

    //------------------------------------------------------------------
    static getById(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.getById()", "<params>", req.params, "<body>", req.body)
        // const { sql, bindVariables } = new SqlBuilder().generateGetStatement(table, req.params["id"], req.body)
        const sql = `SELECT * FROM ${table} WHERE id = ${req.params["id"]}`;
        db.get(sql, [], callback);
    }

    //------------------------------------------------------------------
    static getByForeignKey(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.getByForeignKey()", "<params>", req.params, "<opParms>", opParms, "<body>", req.body)

        // Let's asssume for now that req.params contains the foreign keys
        // Maybe  in req. body one day!
        let wheres = []
        Object.entries(req.params).forEach(([key, val]) => {
            wheres.push(`${key}=${val}`)

        })
        const where = wheres.join(' AND ')
        const sql = `SELECT * FROM ${table} WHERE ${where}`;
        db.all(sql, [], callback);
    }

    //------------------------------------------------------------------
    static update(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.update()", "<params>", req.params, "<body>", req.body)
        //const sql = `UPDATE ${table} SET name = ?, is_open = ? WHERE id = ?`;
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, req.params["id"], req.body)
        db.run(sql, bindVariables, (res) => {
            Konsol.log("UnifiedModel.update() onRes fired, will call callback", "<res>", res)
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
            Konsol.log("UnifiedModel.patch() fired, will call callback", "<res>", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 200, res) : callback(res, 500, null)
        });
    }

    //------------------------------------------------------------------
    static delete(table, req, opParms, callback) {
        Konsol.log("UnifiedModel.delete(), <params>", req.params, "<body>", req.body)
        //const sql = `DELETE FROM ${table} WHERE id = ${req.params["id"]}`;
        const { sql, bindVariables } = new SqlBuilder().generateDeleteStatement(table, req)
        db.run(sql, [], (res) => {
            Konsol.log("UnifiedModel.delete()  fired, will call callback", "<res>", res)
            //res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
            res.lastInsertRowid != null ? callback(null, 204, res) : callback(res, 500, null)
        });
    }
}




export { UnifiedModel } 