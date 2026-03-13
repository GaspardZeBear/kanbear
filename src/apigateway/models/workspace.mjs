import { db } from '../config/database.mjs'
import { SqlBuilder } from './SqlBuilder.mjs'


class Workspace {

  static create(workspace, callback) {
    const { name, is_open } = workspace;
    const sql = 'INSERT INTO workspaces (name, is_open) VALUES (?, ?)';
    db.run(sql, [name, is_open], (res) => {
      console.log("model function onRes fired, will call callback res=", res)
      res.lastInsertRowid ? callback(null, res.lastInsertRowid) : callback(res, null)
    });
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
    console.log("update",workspace)
    const sql = 'UPDATE workspaces SET name = ?, is_open = ? WHERE id = ?';
    db.run(sql, [name, is_open, id], (res) => {
      console.log("model function update onRes fired, will call callback res=", res)
      res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
    });
  }

  static patch(id, workspace, callback) {
    const { name, is_open } = workspace;
    console.log("patch",workspace)
    const { sql, params } = new SqlBuilder().generatePatchStatement('workspaces',id,workspace)
    db.run(sql, [name, is_open, id], (res) => {
      console.log("model function update onRes fired, will call callback res=", res)
      res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
    });
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM workspaces WHERE id = ?';
    db.run(sql, [id], (res) => {
      console.log("model function update onRes fired, will call callback res=", res)
      res.lastInsertRowid != null ? callback(null, res.lastInsertRowid) : callback(res, null)
    });
  }
}

export { Workspace }

