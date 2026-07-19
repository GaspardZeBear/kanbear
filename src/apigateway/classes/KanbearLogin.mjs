// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

class KanbearLogin {

  constructor(params) {
    Konsol.log("KanbearLogin.constructor()", "params", params)
    //this.db = new DatabaseSync('db.sqlite', { readonly: true });
    this.db = db
    this.userName = params.userName
    this.userPassword = params.userPassword
  }

  //-----------------------------------------------------
  async selectUser() {
    Konsol.log("KanbearLogin.selectUser()")
    let req = `
      select
        id uId,  
        name uName,
        password uPassword
      from 
        users
      where
       name='${this.userName}'
      `
    db.all(req, [], this.callAfterUser.bind(this));
  }


  //--------------------------------------------------------
  callAfterUser(err, httpCode, params) {
    Konsol.log("KanbearLogin.callAfterUser() ", params)
    this.userResp = params
    //return (params)
  }

  //-----------------------------------------------------
  async check() {
    await this.selectUser()
    //Konsol.log("KanbearLogin.check() ", "this.UserResp", this.UserResp)
    //Konsol.log("KanbearLogin.check() ", "resp", this.userResp[0].uPassword)
    //Konsol.log("KanbearLogin.check()", " this.userPassword", this.userPassword)
    //try {
      if ( this.userResp.length != 1 ) {
        throw Error("Login check failed", { cause : "user"})
      }
      const valid = bcrypt.compareSync(this.userPassword, this.userResp[0].uPassword);
      if (valid) {
        const token = jwt.sign(
          { userName: this.userName, userId: this.userResp[0].uId },
          'kanbear',
          { expiresIn: '1h' }
        );
        //Konsol.log("KanbearLogin.check()", "token", token)
        return ({userId: this.userResp[0].uId, token:token})
      } else {
        throw Error("Login check failed", { cause : "password"})
      }
    //} catch (err) {
    //  console.log(err)
    //}
  }

}

export { KanbearLogin }
