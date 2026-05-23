import fs from 'fs';
import { WebSocketServer } from 'ws';

class KonsolServer {

  static wss
  static wsClients = {}
  static stackTrace = false

  //----------------------------------------------------------------------------------------------
  static init(server) {
    //const server = createServer(app)
    console.log(`Websocket server creation`);
    KonsolServer.wss = new WebSocketServer({
      //port: 3003,
      noServer: true
    });
    console.log(`Websocket server created`);

    KonsolServer.wss.on('connection', function connection(ws, request) {
      //Konsol.addClient(ws)
      const clientIP = request.socket.remoteAddress;
      const clientPort = request.socket.remotePort
      const id = `${clientIP}:${clientPort}`
      console.log(`Konsol.onConnection() New client ${id} connected`);
      KonsolServer.addClient(id, ws)
      ws.send(JSON.stringify({
        msg: 'Connected to Konsol websocket server',
        status: { stackTrace: KonsolServer.stackTrace }
      }));

      ws.on('message', function message(data) {
        try {
          const messageText = data.toString();
          console.log('KonsolServer ws.onMessage() Received:', messageText);
          if (ws.readyState === ws.OPEN) {
            KonsolServer.stackTrace = !KonsolServer.stackTrace
            ws.send(`Echo: ${messageText} stackTrace=${KonsolServer.stackTrace}`);
          }
        } catch (error) {
          console.error('KonsolServer ws.onMessage() Error processing message:', error);
        }
      });

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

    // Handle upgrade because http server reused (noServer)
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
    }, 30000);

    KonsolServer.wss.on('close', function close() {
      clearInterval(interval);
    });
  }

  //----------------------------------------------------------------------------------------------
  static addClient(id, wsClient) {
    //console.log("Konsol.addClient() <wsClient>",wsClient)
    KonsolServer.wsClients[id] = wsClient
  }

  static broadcast(evt) {
    Object.entries(KonsolServer.wsClients).forEach(([id, ws]) => {
      //Konsol.wsClients.forEach(function each(ws) {
      try {
        ws.send(JSON.stringify(evt))
      } catch (error) {
        console.log("KonsolServer.log() error on send to <id>", id, "<error>", error, "<msg>", msg)
      }
    })
  }
}

  


export { KonsolServer };