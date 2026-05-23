import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
//import { morgan } from 'morgan';
import { db } from './config/database.mjs';
import { WebSocketServer } from 'ws';

// Initialiser l'application Express
const app = express();


// Middlewares
app.use(cors());
app.use(bodyParser.json());
//app.use(morgan('dev'));

// Ajoutez ces lignes après les autres routes
import assigneeRoutes from './routes/assignees.mjs'
import columnRoutes from './routes/columns.mjs'
import swimlaneRoutes from './routes/swimlanes.mjs'
import tagRoutes from './routes/tags.mjs'
import projectRoutes from './routes/projects.mjs'
import userRoutes from './routes/users.mjs'
import taskRoutes from './routes/tasks.mjs'
import workspaceRoutes from './routes/workspaces.mjs'
import projectUserRoutes from './routes/projectUsers.mjs'
import taskHasTagRoutes from './routes/taskHasTags.mjs'
import taskCommentRoutes from './routes/taskComments.mjs'
import { KanbearSqlReporter } from './classes/KanbearSqlReporter.mjs';
//import { createServer } from 'vite';
import { createServer } from 'http';
import { KonsolServer} from './classes/KonsolServer.mjs';
import { Konsol} from './classes/Konsol.mjs';


app.use(express.static('public'))
// Crud api
app.use('/api/assignees', assigneeRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/swimlanes', swimlaneRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects_users', projectUserRoutes);
app.use('/api/task_has_tags', taskHasTagRoutes);
app.use('/api/tasks_comments', taskCommentRoutes);

//------------------------------------------------------------------------------
app.get('/api/sql/report/:projectId', async (req, res) => {
  const projectId = parseInt(req.params.projectId)
  //console.log("--------------------------------------------------------------------------------------------")
  Konsol.log("/api/sql/report params", req.params)
  Konsol.log("/api/sql/report body", req.body)
  Konsol.log("/api/sql/report query", req.query)
  //console.log("--------------------------------------------------------------------------------------------")

  console.log("/api/sql/report invokated pId", projectId)
  try {
    const sqlReporter = new KanbearSqlReporter(false)
    const report = await sqlReporter.getJsonReport(projectId, req.query);
    Konsol.log("api.get() ", report)
    res.json(report);
  } catch (error) {
    console.log("/api/sql/report error ", error.message)
    res.status(500).json({ error: error.message });
  }
  //console.log("/api/sql/report done")
});

// Démarrer le serveur
const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`Serveur http démarré sur le port ${PORT}`);
});
KonsolServer.init(server)

//const server = createServer(app)
/*
console.log(`Websocket server creation`);
const wss = new WebSocketServer({
  //port: 3003,
  noServer: true
});
console.log(`Websocket server created`);

wss.on('connection', function connection(ws, request) {
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

  wss.handleUpgrade(request, socket, head, function done(ws) {
    console.log("handleUpgrade request")
    wss.emit('connection', ws, request);
  })
});

// Ping clients periodically to detect broken connections

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});
*/


