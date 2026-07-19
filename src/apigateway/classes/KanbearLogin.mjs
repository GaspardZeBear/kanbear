// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

class KanbearLogin {

  // PCST mean Projet, Swimlane, Column, Task !!!!!
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
    Konsol.log("KanbearLogin.callAfterUser() <PSTResp>", params)
    this.UserResp = params
    //return (params)
  }

  //-----------------------------------------------------
  async check() {
    await this.selectUser()
    Konsol.log("KanbearLogin.check() ", "resp", this.UserResp)
    Konsol.log("KanbearLogin.check()"," this.userPassword",this.userPassword, bcrypt.hashSync(this.userPassword,10))
    Konsol.log("KanbearLogin.check()"," this.userPassword async",this.userPassword, await bcrypt.hash(this.userPassword,10))
    const valid = bcrypt.compareSync(this.userPassword,this.UserResp.uPassword);
    if (valid) {
      const token = jwt.sign(
        { user: this.userName },
        'process.env.JWT_SECRET',
        { expiresIn: '1h' }
      );
      return (token)
    } else {
      throw Error("Beurk")
    }
  }

}

export { KanbearLogin }
