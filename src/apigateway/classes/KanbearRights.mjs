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
    let wreq = `
      select
        id id,
        workspace_id as workspace_id,
        rights rights
      from 
        workspaces_rights
      where
       user_id='${this.userId}'
       `
    let preq=`
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
    let wResp
    db.all(wreq, [], (err, httpCode, sqlResp) => {
      Konsol.log("KanbearRights loadRights() callback()","wreq", wreq)
      Konsol.log("KanbearRights loadRights() callback()","sqlResp", sqlResp)
      wResp = sqlResp
      //return (params)
    });
    let pResp
    db.all(preq, [], (err, httpCode, sqlResp) => {
      Konsol.log("KanbearRights loadRights() callback()","preq", preq)
      Konsol.log("KanbearRights loadRights() callback()","sqlResp", sqlResp)
      //this.rightsResp = sqlResp
      pResp = sqlResp
      //return (params)
    });
    let rights={data:{workspaces:{},projects:{}}}
    wResp.forEach(element => {
      rights.data["workspaces"][element.id]=element.rights
    });
    pResp.forEach(element => {
      rights.data["projects"][element.id]=element.rights
    });
    this.rightsResp=rights
  }


  //--------------------------------------------------------
  //callAfterRights(err, httpCode, params) {
  //Konsol.log("KanbearRights.callAfterUser() ", params)
  //  this.rightsResp = params
  //  //return (params)
  //}

  //-----------------------------------------------------
  load() {
    
    this.loadRights()
    Konsol.log("KanbearRights.load() this.rightsResp",this.rightsResp)
    //try {
    /*
    if (this.rightsResp.length != 1) {
      //throw Error("no rights", { cause: "user" })
      return ({})
    }
      */
    //return ({})
    return (this.rightsResp)
    //} catch (err) {
    //  console.log(err)
    //}
  }

  //-----------------------------------------------------
  async isAllowed(kind, name) {
  }

}

export { KanbearRights }
