import fs from 'fs';
import { WebSocketServer } from 'ws';

class KonsolClient {

  static wss
  static stackTrace = false
  static konsol

  //----------------------------------------------------------------------------------------------
  static init(url = "ws://localhost:3002/logger") {
    console.log("KonsolClient.connect() connecting to ", url)
    KonsolClient.konsol = new WebSocket(url);
    KonsolClient.konsol.onmessage = function (event) {
      console.log("KonsolClient.onMessage()) ", event.data);
    };
    KonsolClient.konsol.onopen = function () {
      //append(`konsolClient.connect() connected to ${url}`);
      console.log("KonsolClient.connect() connected to ", url)
    };
    KonsolClient.konsol.onclose = function () {
      console.log("KonsolClient.onclose() Connection closed");
      KonsolClient.konsol = null
    };
    KonsolClient.konsol.onerror = function () {
      console.log("KonsolClient.connect onerror happens");
    };
  };

  //------------------------------------------------------------------------------------------------
  static broadcast(evt) {
    try {
      evt.origin = "KonsolClient"
      if (KonsolClient.konsol) {
        KonsolClient.konsol.send(JSON.stringify(evt))
      }
    } catch (error) {
      console.log("KonsolClient.log() error on send to", "<error>", error, "<msg>")
    }
  }
}



export { KonsolClient };