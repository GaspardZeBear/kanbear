import { db } from '../config/database.mjs'

class UserGroup {
  static create(groupUser, callback) {
    const { group_id, user_id, right } = groupUser;
    const sql = 'INSERT INTO users_groups (group_id, user_id, right) VALUES (?, ?, ?)';
    db.run(sql, [group_id, user_id, right], function(err) {
      callback(err, this.lastID);
    });
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
  static delete(groupId, userId, callback) {
    const sql = 'DELETE FROM users_groups WHERE group_id = ? AND user_id = ?';
    db.run(sql, [groupId, userId], callback);
  }
}

export {  UserGroup } 

