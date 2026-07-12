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
/*
import { createServer } from 'http';
import { KonsolServer} from './classes/KonsolServer.mjs';
import { KonsolClient} from './classes/KonsolClient.mjs';
import { Konsol} from './classes/Konsol.mjs';
*/
import { Konsol} from 'konsol';
import { Logger} from 'konsol';
import { Server} from 'konsol';



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
app.get('/api/sql/report/:projectId', 
    (req, res, next) => {
    console.log("apigateway ",req.headers) 
    next();
    // otherwise pass the control to the next middleware function in this stack
    },async (req, res) => {
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

/*
KonsolServer.init(server,{
      //port: 3003,
      noServer: true,
      clientTracking: true
    })
KonsolClient.init('apigateway',`ws://localhost:${PORT}/logger`)
*/
Server.init(server,{
      //port: 3003,
      noServer: true,
      clientTracking: true
    })
Logger.init('apigateway',`ws://localhost:${PORT}/logger`)




