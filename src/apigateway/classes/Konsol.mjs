import fs from 'fs';
import { WebSocketServer } from 'ws';

class Konsol {

  static wss
  static wsClients = {}
  static stackTrace = true

  //----------------------------------------------------------------------------------------------
  static init(server) {
    //const server = createServer(app)
    console.log(`Websocket server creation`);
    Konsol.wss = new WebSocketServer({
      //port: 3003,
      noServer: true
    });
    console.log(`Websocket server created`);

    Konsol.wss.on('connection', function connection(ws, request) {
      //Konsol.addClient(ws)
      const clientIP = request.socket.remoteAddress;
      const clientPort = request.socket.remotePort
      const id = `${clientIP}:${clientPort}`
      console.log(`Konsol.onConnection() New client ${id} connected`);
      Konsol.addClient(id, ws)
      ws.send('Connected to Konsol websocket server');

      ws.on('message', function message(data) {

        try {
          const messageText = data.toString();
          console.log('Konsol ws.onMessage() Received:', messageText);
          if (ws.readyState === ws.OPEN) {
            Konsol.stackTrace = !Konsol.stackTrace
            ws.send(`Echo: ${messageText} stackTrace=${Konsol.stackTrace}`);
          }
        } catch (error) {
          console.error('Konsol ws.onMessage() Error processing message:', error);
        }
      });

      ws.on('close', function close(code, reason) {
        console.log(`Konsol.onClose() Client ${id} disconnected - Code: ${code}, Reason: ${reason}`);
      });

      ws.on('error', function error(err) {
        console.error('Konsol.onError() WebSocket error:', err);
      });

      ws.on('pong', function heartbeat() {
        ws.isAlive = true;
      });

      ws.isAlive = true;

    });

    // Handle upgrade because http server reused (noServer)
    server.on('upgrade', function upgrade(request, socket, head) {
      console.log("Konsol.onUpgrade() handler ")
      const { pathname } = new URL(request.url, 'wss://base.url');

      Konsol.wss.handleUpgrade(request, socket, head, function done(ws) {
        console.log("Konsol.handleUpgrade request")
        Konsol.wss.emit('connection', ws, request);
      })
    });

    // Ping clients periodically to detect broken connections

    const interval = setInterval(function ping() {
      //Konsol.wss.clients.forEach(function each(ws) {
      Object.entries(Konsol.wsClients).forEach(([id, ws]) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    Konsol.wss.on('close', function close() {
      clearInterval(interval);
    });
  }

  //----------------------------------------------------------------------------------------------
  static addClient(id, wsClient) {
    //console.log("Konsol.addClient() <wsClient>",wsClient)
    Konsol.wsClients[id] = wsClient
  }

  //----------------------------------------------------------------------------------------------
  static log(...msg) {
    let stack = ""
    if (Konsol.stackTrace) {
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
        date: ddated,
        stack: stack,
        correlationId: now,
        fields: []
      }
      for (let m of msg) {
        //evt.fields.push(`${JSON.stringify(m).substring(0, 160)} ...`)
        evt.fields.push(m)
        //console.log('Konsol.log() ', evt)
      }
      Object.entries(Konsol.wsClients).forEach(([id, ws]) => {
        //Konsol.wsClients.forEach(function each(ws) {
        try {
          ws.send(JSON.stringify(evt))
        } catch (error) {
          console.log("Konsol.log() error on send to <id>", id, "<error>", error, "<msg>", msg)
        }
      })
    } catch (error) {
      console.log("Konsol.log() error on log <error>", error, "<msg>", msg)
    }
  }
}

export { Konsol };