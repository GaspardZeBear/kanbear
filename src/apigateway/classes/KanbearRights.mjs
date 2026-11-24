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
    console.log("KanbearRights.constructor()", ownerType, ownerId)
    this.ownerId = ownerId
    this.ownerType = ownerType
    //onsol.log("KanbearRights.constructor()", this.ownerType, this.ownerId)
    if (this.ownerType === 'user') {
      this.isAdmin = this.isAdminSql()
    }
    this.userRights = null
    this.groupsRights = null
    this.analysis=[]
  }

  //-----------------------------------------------------
  isAdminSql() {
    console.log("KanbearRights.isAdmin()", this.ownerType, this.ownerId)
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
  loadUserRights() {
    console.log("KanbearRights.loadUserRights() begin")
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
       and owner_type='user'
    `
    let resp
    db.all(req, [], (err, httpCode, sqlResp) => {
      //Konsol.log("KanbearRights loadRights() callback()", "wreq", wreq)
      //Konsol.log("KanbearRights loadRights() callback()", "sqlResp", sqlResp)
      resp = sqlResp
      //return (params)
    });
    console.log("KanbearRights.loadUserRights() resp", "<rights>", resp)
    let rights = { data: { workspaces: {}, projects: {} } }
    resp.forEach(element => {
      rights.data[`${element.target_kind}s`][element.target_id] = element.rights
    });

    
    this.userRights = rights["data"] ?? null
    this.analysis.push(" userRights ", this.userRights)
    //return (this.resp)
    console.log("KanbearRights.loadUserRights() end")
  }

  //-----------------------------------------------------
  loadGroupsRights() {
    console.log("KanbearRights.loadGroupsRights() begin")
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
        owner_type='group'
        and
        owner_id in (
          select
           group_id
          from 
            users_groups
          where 
            user_id='${this.ownerId}'
  )
    `
    let resp
    db.all(req, [], (err, httpCode, sqlResp) => {
      //Konsol.log("KanbearRights loadRights() callback()", "wreq", wreq)
      //Konsol.log("KanbearRights loadRights() callback()", "sqlResp", sqlResp)
      resp = sqlResp
      //return (params)
    });
    console.log("KanbearRights.loadGroupRights() resp", resp)

    let rights = { data: { workspaces: {}, projects: {} } }

    resp.forEach(element => {
      console.log("KanbearRights.loadGroupRights() element", element)
      let targetKind = `${element.target_kind}s`
      let targetId = element.target_id.toString()
      let eRights = element.rights
      console.log("KanbearRights.loadGroupRights() go  ", this.userRights, targetKind, targetId, "xxx", this.userRights?.[targetKind]?.[targetId])
      if (!this.userRights?.[targetKind]?.[targetId]) {
        console.log("KanbearRights.loadGroupRights() keeping  ", targetKind, targetId, "rights", rights)
        // remove all that is in userRights ( user is more important than groups)
        // if not exists in groupRights, create
        // if  exists in groupRights, bitwise or (take the most permissive value)
        if (!rights.data?.[targetKind]?.[targetId]) {
          console.log("KanbearRights.loadGroupRights() creating  ", eRights)
          rights.data[targetKind][targetId] = eRights
        } else {
          console.log("KanbearRights.loadGroupRights() merging  ", rights.data[targetKind][targetId], eRights)
          rights.data[targetKind][element.target_id] = rights.data[targetKind][targetId] | eRights
        }
      } else {
        console.log("KanbearRights.loadGroupRights() discarding ", rights?.[targetKind]?.[targetId])
      }
    });
    console.log("KanbearRights.loadRights() over", "<rights>", rights)
    this.groupsRights = rights["data"] ?? null
    //return (this.resp)
  }


  //-----------------------------------------------------
  load() {
    if (this.isAdmin) {
      return ({})
    }
    if (!this.userRights) {
      this.loadUserRights()
      console.log("KanbearRights.loadUserRights() over", "<rights>", this.userRights)
      this.loadGroupsRights()
      console.log("KanbearRights.loadGroupsRights() over", "<rights>", this.groupsRights)
      
    }
    //Konsol.log("KanbearRights.load() over", "<rights>", this.userRights)
    const resultat = {
        workspaces: { ...this.userRights.workspaces, ...this.groupsRights.workspaces },
        projects: { ...this.userRights.projects, ...this.groupsRights.projects }
      };
    console.log("KanbearRights.load() over", "<resultat>", resultat)
    return (resultat)
  }

  //-----------------------------------------------------
  async isAllowed(kind, name) {
  }

}

export { KanbearRights }
