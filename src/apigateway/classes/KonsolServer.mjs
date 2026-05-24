import fs from 'fs';
import { WebSocketServer } from 'ws';

class KonsolServer {

  static wss
  static wsClients = {}
  static stackTrace = false

  //----------------------------------------------------------------------------------------------
  static init(server, parms = {
    //port: 3003,
    noServer: true,
    clientTracking: true
  }) {
    //const server = createServer(app)
    console.log(`Websocket server creation`);
    KonsolServer.wss = new WebSocketServer(parms);
    console.log(`Websocket server created`);

    KonsolServer.wss.on('connection', function connection(ws, request) {
      //Konsol.addClient(ws)
      const clientIP = request.socket.remoteAddress;
      const clientPort = request.socket.remotePort
      const id = `${clientIP}:${clientPort}`
      console.log("KonsolServer.onConnection() New client connected", "<id>", id, "request.url", request.url);
      ws.isLogger = true
      let messageProcessorFn
      if (request.url != "/logger") {
        console.log("KonsolServer.onConnection() New client connected", "<id>", id, "request.url", request.url, " is a logbrowser");
        KonsolServer.addClient(id, ws)
        ws.isLogger = false
        messageProcessorFn = messageFromLogBrowser
      } else {
        console.log("KonsolServer.onConnection() New client connected", "<id>", id, "request.url", request.url, " is a logger");
        ws.isLogger = true
        messageProcessorFn = messageFromLogger
      }

      ws.send(JSON.stringify({
        date: new Date().toISOString(),
        type: 'status',
        fields: [
          { msg: 'Connected to Konsol websocket server' },
          { status: { stackTrace: KonsolServer.stackTrace } }]
      }
      ));

      //--------------------------------------------
      function messageFromLogger(data) {
        KonsolServer.broadcast(JSON.parse(data))
      }

      //-------------------------------------------
      function messageFromLogBrowser(data) {
        let msgType = 'rsp'
        try {
          let msg = JSON.parse(data)
          if (msg.type === "cmd" && msg.value) {
            switch (msg.value) {
              case "toggleStackTrace":
                KonsolServer.stackTrace = !KonsolServer.stackTrace
                break
              case "toggleStackTrace":
                break
            }
          } else {
            throw Error('Unknown msg')
          }
        } catch (error) {
          console.log(error)
          msgType = 'status'
        } finally {
          ws.send(JSON.stringify({
            date: new Date().toISOString(),
            type: msgType,
            fields: [
              { msg: 'Connected to Konsol websocket server' },
              { status: { stackTrace: KonsolServer.stackTrace } }]
          }))
        }
      }

      //----------------------------
      ws.on('message', function message(data) {
        if (ws.readyState === ws.OPEN) {
          messageProcessorFn(data)
        }
      })

      ws.on('close', function close(code, reason) {
        console.log(`KonsolServer.onClose() Client ${id} disconnected - Code: ${code}, Reason: ${reason}`);
      });

      ws.on('error', function error(err) {
        console.error('KonsolServer.onError() WebSocket error:', err);
      });

      ws.on('pong', function heartbeat() {
        ws.isAlive = true;
      });

      ws.isAlive = true;

    });

    //-------------------   Handle upgrade because http server reused (noServer)
    server.on('upgrade', function upgrade(request, socket, head) {
      console.log("KonsolServer.onUpgrade() handler ")
      const { pathname } = new URL(request.url, 'wss://base.url');

      KonsolServer.wss.handleUpgrade(request, socket, head, function done(ws) {
        console.log("KonsolServer.handleUpgrade request")
        KonsolServer.wss.emit('connection', ws, request);
      })
    });

    // Ping clients periodically to detect broken connections

    const interval = setInterval(function ping() {
      //Konsol.wss.clients.forEach(function each(ws) {
      Object.entries(KonsolServer.wsClients).forEach(([id, ws]) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 15000);

    KonsolServer.wss.on('close', function close() {
      clearInterval(interval);
    });
  }

  //----------------------------------------------------------------------------------------------
  static addClient(id, wsClient) {
    //console.log("Konsol.addClient() <wsClient>",wsClient)
    KonsolServer.wsClients[id] = wsClient
  }

  //----------------------------------------------------------------------------------------------
  static broadcast(evt) {
    //console.log("KonsolServer.broadcast()", "evt", JSON.stringify(evt))
    Object.entries(KonsolServer.wsClients).forEach(([id, ws]) => {
      //console.log("KonsolServer.broadcast() to", "id", id)
      try {
        ws.send(JSON.stringify(evt))
      } catch (error) {
        console.log("KonsolServer.log() error on send to <id>", id, "<error>", error, "<msg>", msg)
      }
    })
  }
}




export { KonsolServer };