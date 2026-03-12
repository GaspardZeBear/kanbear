import { db } from '../config/database.mjs'

class Workspace {
  static create(workspace, callback) {
    const { name, is_open } = workspace;
    const sql = 'INSERT INTO workspaces (name, is_open) VALUES (?, ?)';
    //db.run(sql, [name, is_open], function(err) {
    //  callback(err, this.lastID);
    //});
    const exec=db.prepare(sql, [name, is_open]).exec()
    console.log(exec)
  }

  static NgetAll(callback) {
    const sql = 'SELECT * FROM workspaces';
    //db.all(sql, [], callback);
    const exec = db.prepare(sql,[]).all()
    console.log("models/Workspace.getAll()",sql, exec,callback)
    callback(exec)
    
  }
   static getAll(callback) {
    const sql = 'SELECT * FROM workspaces';
    db.all(sql, [], callback);
  }


  static getById(id, callback) {
    const sql = 'SELECT * FROM workspaces WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static update(id, workspace, callback) {
    const { name, is_open } = workspace;
    const sql = 'UPDATE workspaces SET name = ?, is_open = ? WHERE id = ?';
    db.run(sql, [name, is_open, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM workspaces WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Workspace } 

