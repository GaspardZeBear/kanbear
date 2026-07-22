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
        Konsol.log("KanbearRights.constructor()", "userId", userId)
        //this.db = new DatabaseSync('db.sqlite', { readonly: true });
        this.db = db
        this.userId = userId
    }

    //-----------------------------------------------------
    async loadRights() {
        Konsol.log("KanbearRights.loadRights()")
        let req = `
      select
        id id,  
        'workspaces',
        workspace_id tId,
        rights
      from 
        workspaces_rights
      where
       user_id='${this.userId}'
      union
      select
        id id,  
        'projects',
        project_id tId,
        rights
      from 
        projects_rights
      where
       user_id='${this.userId}'
      `
        db.all(req, [], this.callAfterRights.bind(this));
    }


    //--------------------------------------------------------
    callAfterRights(err, httpCode, params) {
        Konsol.log("KanbearRights.callAfterUser() ", params)
        this.rightsResp = params
        //return (params)
    }

    //-----------------------------------------------------
    async load() {
        Konsol.log("KanbearRights.load() ")
        await this.loadRights()
        //try {
        if (this.rightsResp.length != 1) {
            throw Error("no rights", { cause: "user" })
        }
        return ({})
        //} catch (err) {
        //  console.log(err)
        //}
    }

}

export { KanbearRights }
