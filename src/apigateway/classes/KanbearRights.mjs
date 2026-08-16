// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
//import jwt from 'jsonwebtoken'
//import bcrypt from 'bcrypt'

class KanbearRights {

  constructor(userId) {
    //Konsol.log("KanbearRights.constructor()", "userId", userId)
    //this.db = new DatabaseSync('db.sqlite', { readonly: true });
    //this.db = db
    this.userId = userId
  }

  //-----------------------------------------------------
  isAdmin() {
    Konsol.log("KanbearRights.isAdmin()")
    let req = `
      select
        id id,  
        name name,
        is_admin isAdmin
      from 
        users
      where
       id='${this.userId}'
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
        workspace_id as workspace_id,
        rights rights
      from 
        workspaces_rights
      where
       user_id='${this.userId}'
      union
      select
        id id,  
        project_id as project_id,
        rights
      from 
        projects_rights
      where
       user_id='${this.userId}'
      `
    //    db.all(req, [], this.callAfterRights.bind(this));
    db.all(req, [], (err, httpCode, params) => {
      Konsol.log("KanbearRights loadRights() callback() params", params)
      this.rightsResp = params
      //return (params)
    });
  }


  //--------------------------------------------------------
  //callAfterRights(err, httpCode, params) {
  //Konsol.log("KanbearRights.callAfterUser() ", params)
  //  this.rightsResp = params
  //  //return (params)
  //}

  //-----------------------------------------------------
  load() {
    //Konsol.log("KanbearRights.load() ")
    this.loadRights()
    //try {
    if (this.rightsResp.length != 1) {
      //throw Error("no rights", { cause: "user" })
      return ({})
    }
    //return ({})
    return (this.rightsResp[0])
    //} catch (err) {
    //  console.log(err)
    //}
  }

  //-----------------------------------------------------
  async isAllowed(kind, name) {
  }

}

export { KanbearRights }
