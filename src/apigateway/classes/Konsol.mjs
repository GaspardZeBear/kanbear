import fs from 'fs';
import { WebSocketServer } from 'ws';

class Konsol {

    static wss
    static wsClient

    static init(server) {
        //const server = createServer(app)
        console.log(`Websocket server creation`);
        Konsol.wss = new WebSocketServer({
          //port: 3003,
          noServer: true
        });
        console.log(`Websocket server created`);
        
        Konsol.wss.on('connection', function connection(ws, request) {
          Konsol.setClient(ws)
          const clientIP = request.socket.remoteAddress;
          console.log(`New client connected from ${clientIP}`);
          ws.send('Welcome to the WebSocket server!');
          ws.on('message', function message(data) {
            try {
              const messageText = data.toString();
              console.log('Received:', messageText);
              if (ws.readyState === ws.OPEN) {
                ws.send(`Echo: ${messageText}`);
              }
            } catch (error) {
              console.error('Error processing message:', error);
            }
          });
        
          ws.on('close', function close(code, reason) {
            console.log(`Client disconnected - Code: ${code}, Reason: ${reason}`);
          });
        
          ws.on('error', function error(err) {
            console.error('WebSocket error:', err);
          });
        
          ws.on('pong', function heartbeat() {
            ws.isAlive = true;
          });
        
          ws.isAlive = true;
        
        });
        
        // Handle upgrade because http server reused (noServer)
        server.on('upgrade', function upgrade(request, socket, head) {
          console.log("upgrade request")
          const { pathname } = new URL(request.url, 'wss://base.url');
        
          Konsol.wss.handleUpgrade(request, socket, head, function done(ws) {
            console.log("handleUpgrade request")
            Konsol.wss.emit('connection', ws, request);
          })
        });
        
        // Ping clients periodically to detect broken connections
        
        const interval = setInterval(function ping() {
          Konsol.wss.clients.forEach(function each(ws) {
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

    static setClient(wsClient) {
        Konsol.wsClient = wsClient
    }

    static log(...msg) {
        try {
            const ddate = new Date()
            const now = Date.now()
            const ddated = ddate.toISOString()
            let evt = {
                type: 'log',
                date: ddated,
                correlationId: now,
                fields: []
            }
            for (let m of msg) {
                //evt.fields.push(`${JSON.stringify(m).substring(0, 160)} ...`)
                evt.fields.push(m)
                //console.log('Konsol.log() ', evt)
            }
            Konsol.wsClient.send(JSON.stringify(evt))
        } catch (error) {
            console.log("Konsol.log() error <error>", error, "<msg>", msg)
        }
    }
}


export { Konsol };