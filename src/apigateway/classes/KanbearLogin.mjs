import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import { KanbearRights } from './KanbearRights.mjs';
import { KanbearUser } from './KanbearUser.mjs';

import bcrypt from 'bcrypt'

class KanbearLogin {

  constructor(params) {
    Konsol.log("KanbearLogin.constructor()", "params", params)
    this.userName = params.userName
    this.userPassword = params.userPassword
  }

  //-----------------------------------------------------
  async check() {
    //let user0 = new KanbearUser()
    //await user0.selectUserByName(this.userName)
    //let user = user0.getUser()
    let user = (await (new KanbearUser()).selectUserByName(this.userName)).getUser()
    if (user == null) {
      throw Error("Login check failed", { cause: "no user" })
    }
    const valid = bcrypt.compareSync(this.userPassword, user.password);
    Konsol.log("KanbearLogin.check() ", "user/password valid", valid)
    if (valid) {
      let kanbearRights = new KanbearRights(user.userId).load()
      Konsol.log("KanbearLogin.check() ", kanbearRights)
      return ({
        isAdmin: user.isAdmin,
        userName: user.userName,
        userId: user.userId,
        rights: kanbearRights
      })
    } else {
      throw Error("Login check failed", { cause: "user or password wrong" })
    }
  }

}

export { KanbearLogin }
