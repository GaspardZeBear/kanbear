import { db } from '../config/database.mjs'

class UnifiedModel {

    static UnifiedModelOp = {}
    static {
        UnifiedModel.UnifiedModelOp['create'] = UnifiedModel.create
        UnifiedModel.UnifiedModelOp['getAll'] = UnifiedModel.getAll
        UnifiedModel.UnifiedModelOp['getById'] = UnifiedModel.getById
        UnifiedModel.UnifiedModelOp['update'] = UnifiedModel.update
        UnifiedModel.UnifiedModelOp['patch'] = UnifiedModel.patch
        UnifiedModel.UnifiedModelOp['delete'] = UnifiedModel.delete
    }

    static create(table, params, body, callback) {
        const { name, is_open } = body;
        const sql = `INSERT INTO ${table} (name, is_open) VALUES (?, ?)`;
        db.run(sql, [name, is_open], (res) => {
            console.log("UnifiedModel.create(), will call callback <res>", res)
            res.lastInsertRowid ? callback(null, res.lastInsertRowid) : callback(res, null)
        });
    }

    static getAll(table, params, body, callback) {
        console.log("UnifiedModel.getAll(), will call callback res=")
        const sql = `SELECT * FROM ${table}`;
        db.all(sql, [], callback);
    }


    static getById(table, params, body, callback) {
        console.log("UnifiedModel.getById(), <params>", params, "<body>", body)
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        db.get(sql, params["id"], callback);
    }

    static update(table, params, body, callback) {
        console.log("UnifiedModel.update(), <params>", params, "<body>", body)
        const { name, is_open } = body;
        console.log("update", workspace)
        //const sql = `UPDATE ${table} SET name = ?, is_open = ? WHERE id = ?`;
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, params["id"], body)
        db.run(sql, bindVariables, (res) => {
            console.log("UnifiedModel.update() onRes fired, will call callback res=", res)
            res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
        });
    }

    static patch(table, params, body, callback) {
        // const { name, is_open } = workspace;
        console.log("UnifiedModel.patch(), <params>", params, "<body>", body)
        const { sql, bindVariables } = new SqlBuilder().generatePatchStatement(table, params["id"], body)
        db.run(sql, bindVariables, (res) => {
            console.log("UnifiedModel.patch() fired, will call callback res=", res)
            res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
        });
    }

    static delete(table, params, body, callback) {
        console.log("UnifiedModel.delete(), <params>",params,"<body>",body)
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        db.run(sql, params["id"], (res) => {
            console.log("UnifiedModel.delete()  fired, will call callback res=", res)
            res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
        });
    }
}




export { UnifiedModel } 