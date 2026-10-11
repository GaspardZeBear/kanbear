import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import { KanbearRights } from './KanbearRights.mjs';
import bcrypt from 'bcrypt'

class KanbearUser {

    constructor(params = {}) {
        Konsol.log("KanbearUser.constructor()", "params", params)
        //this.db = new DatabaseSync('db.sqlite', { readonly: true });
        //this.db = db
        this.user = null
    }
    //-----------------------------------------------------
    async selectUserByName(userName) {
        Konsol.log("KanbearUser.selectUserByName()")
        let req = `
      select
        id uId,  
        name uName,
        password uPassword,
        is_admin uIsAdmin
      from 
        users
      where
       name='${userName}'
      `
        db.all(req, [], this.callAfterUser.bind(this));
        // Must return this to chain methods !!!
        return(this)
    }

    //-----------------------------------------------------
    async selectUserById(userId) {
        Konsol.log("KanbearUser.selectUserById()")
        let req = `
      select
        id uId,  
        name uName,
        password uPassword,
        is_admin uIsAdmin
      from 
        users
      where
       id=${parseInt(userId)}
      `
        db.all(req, [], this.callAfterUser.bind(this));
        return(this)
    }

    //--------------------------------------------------------
    callAfterUser(err, httpCode, params) {
        Konsol.log("KanbearUser.callAfterUser() ", params)
        this.user = {
            userName: params[0].uName,
            userId: params[0].uId,
            password: params[0].uPassword,
            isAdmin: params[0].uIsAdmin
        }        //return (params)
    }

    //--------------------------------------------------------
    getUser() {
        Konsol.log("Kanbear.getUser() user ", this.user)
        return (this.user)
        //return (params)
    }


}

export { KanbearUser }