import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
//import { morgan } from 'morgan';
import { db } from './config/database.mjs';

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
//app.use(morgan('dev'));

// Ajoutez ces lignes après les autres routes
import assigneeRoutes from './routes/assignees.mjs'
import columnRoutes  from './routes/columns.mjs'
import swimlaneRoutes  from './routes/swimlanes.mjs'
import tagRoutes  from './routes/tags.mjs'
import projectRoutes  from './routes/projects.mjs'
import userRoutes  from './routes/users.mjs'
import workspaceRoutes  from './routes/workspaces.mjs'
import projectUserRoutes  from './routes/projectUsers.mjs'
import taskHasTagRoutes  from './routes/taskHasTags.mjs'
import taskCommentRoutes  from './routes/taskComments.mjs'

app.use('/api/assignees', assigneeRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/swimlanes', swimlaneRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects_users', projectUserRoutes);
app.use('/api/task_has_tags', taskHasTagRoutes);
app.use('/api/tasks_comments', taskCommentRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

