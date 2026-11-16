import { db } from '../config/database.mjs'

class UserGroup {
  static create(userGroup, callback) {
    const { group_id, user_id } = userGroup;
    const sql = 'INSERT INTO users_groups (group_id, user_id) VALUES (?, ?)';
    //db.run(sql, [group_id, user_id], function(err) {
    //  callback(err, this.lastID);
    //});
    db.run(sql, [group_id, user_id],callback)
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM users_groups';
    db.all(sql, [], callback);
  }

  static getByGroupId(groupId, callback) {
    const sql = 'SELECT * FROM users_groups WHERE group_id = ?';
    db.all(sql, [groupId], callback);
  }

  static getByUserId(userId, callback) {
    const sql = 'SELECT * FROM users_groups WHERE user_id = ?';
    db.all(sql, [userId], callback);
  }
  static delete(id, callback) {
    const sql = 'DELETE FROM users_groups WHERE id = ? ';
    db.run(sql, [id], callback);
  }
}

export {  UserGroup } 

