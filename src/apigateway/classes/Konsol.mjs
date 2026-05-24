//import fs from 'fs';
//import { WebSocketServer } from 'ws';
import { KonsolServer } from './KonsolServer.mjs';
import { KonsolClient } from './KonsolClient.mjs';

class Konsol {

  //----------------------------------------------------------------------------------------------
  static log(...msg) {
    let stack = ""
    if (KonsolServer.stackTrace) {
      try {
        throw new Error("Konsol")
      } catch (error) {
        stack = error.stack
      }
    }
    try {
      const ddate = new Date()
      const now = Date.now()
      const ddated = ddate.toISOString()
      let evt = {
        type: 'log',
        level: 'log',
        date: new Date().toISOString(),
        stack: stack,
        correlationId: now,
        fields: []
      }
      for (let m of msg) {
        evt.fields.push(m)
      }
      //KonsolServer.broadcast(evt)
      KonsolClient.broadcast(evt)
    } catch (error) {
      console.log("Konsol.log() error on log <error>", error, "<msg>", msg)
    }
  }
}

export { Konsol };