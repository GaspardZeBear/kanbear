// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
//import jwt from 'jsonwebtoken'
//import bcrypt from 'bcrypt'

class KanbearRights {

  constructor(ownerType, ownerId) {
    //Konsol.log("KanbearRights.constructor()", "userId", userId)
    //this.db = new DatabaseSync('db.sqlite', { readonly: true });
    //this.db = db
    Konsol.log("KanbearRights.constructor()", ownerType, ownerId)
    this.ownerId = ownerId
    this.ownerType = ownerType
    Konsol.log("KanbearRights.constructor()", this.ownerType, this.ownerId)
    if (this.ownerType === 'user') {
      this.isAdmin = this.isAdminSql()
    }
    this.rights = null
  }

  //-----------------------------------------------------
  isAdminSql() {
    Konsol.log("KanbearRights.isAdmin()", this.ownerType, this.ownerId)
    let req = `
      select
        id id,  
        name name,
        is_admin isAdmin
      from 
        users
      where
       id='${this.ownerId}'
      `
    //    db.all(req, [], this.callAfterRights.bind(this));
    let user
    db.all(req, [], (err, httpCode, params) => {
      //Konsol.log("KanbearRights.callAfterUser() params", params)
      user = params
      //return (params)
    });
    //Konsol.log("KanbearRights.callAfterUser() user[0]", user[0].isAdmin)
    if (user[0].isAdmin == 0) {
      return (false)
    } else {
      return (true)
    }

  }

  //-----------------------------------------------------
  loadRights() {
    Konsol.log("KanbearRights.loadRights()")
    let req = `
      select
        id id,
        owner_id as owner_id,
        owner_type as owner_type,
        target_kind as target_kind,
        target_id as target_id,
        rights rights
      from 
        rights
      where
       owner_id='${this.ownerId}'
       and owner_type='${this.ownerType}'
    `
    let resp
    db.all(req, [], (err, httpCode, sqlResp) => {
      //Konsol.log("KanbearRights loadRights() callback()", "wreq", wreq)
      //Konsol.log("KanbearRights loadRights() callback()", "sqlResp", sqlResp)
      resp = sqlResp
      //return (params)
    });

    let rights = { data: { workspaces: {}, projects: {} } }
    resp.forEach(element => {
      rights.data[element.target_kind][element.target_id] = element.rights
    });

    Konsol.log("KanbearRights.loadRights() over", "<rights>", rights)
    this.resp = rights["data"] ?? null
    return (this.resp)
  }

  //-----------------------------------------------------
  load() {
    if ( this.isAdmin ) {
      return({})
    }
    if (!this.resp) {
      this.loadRights()
    }
    return (this.resp)
  }

  //-----------------------------------------------------
  async isAllowed(kind, name) {
  }

}

export { KanbearRights }
