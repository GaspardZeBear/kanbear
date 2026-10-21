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
import projectRightsRoutes from './routes/projectRights.mjs'
import workspaceRightsRoutes from './routes/workspaceRights.mjs'
import userRoutes from './routes/users.mjs'
import taskRoutes from './routes/tasks.mjs'
import workspaceRoutes from './routes/workspaces.mjs'
import projectUserRoutes from './routes/projectUsers.mjs'
import taskHasTagRoutes from './routes/taskHasTags.mjs'
import taskCommentRoutes from './routes/taskComments.mjs'
import { KanbearSqlReporter } from './classes/KanbearSqlReporter.mjs';
import { KanbearLogin } from './classes/KanbearLogin.mjs';
//import { createServer } from 'vite';
/*
import { createServer } from 'http';
import { KonsolServer} from './classes/KonsolServer.mjs';
import { KonsolClient} from './classes/KonsolClient.mjs';
import { Konsol} from './classes/Konsol.mjs';
*/
import { Konsol } from 'konsol';
import { Logger } from 'konsol';
import { Server } from 'konsol';
import { controlToken } from './middlewares/tokenControl.mjs';
import { KanbearTokens } from './classes/KanbearTokens.mjs';
import { KanbearUser } from './classes/KanbearUser.mjs';
import { KanbearRights } from './classes/KanbearRights.mjs';




app.use(express.static('public'))
// Crud api

let refreshTokens = [];

//------------------------------------------------------------------------------
app.post('/api/login',
  async (req, res) => {
    Konsol.log("apigateway login", req.body)
    try {
      let login = new KanbearLogin({ userName: req.body.userName, userPassword: req.body.userPassword })
      const check = await login.check()
      Konsol.log("apigateway login check", check)
      let token = new KanbearTokens().generateToken(check)
      let refreshToken = new KanbearTokens().generateRefreshToken(check)
      refreshTokens.push(refreshToken);
      res.status(200).json({ message: 'Logged in', token: token, userId: check.userId, rights: check.rights, refreshToken: refreshToken });
    } catch (error) {
      console.log("/api/login error ", error.message)
      res.status(500).json({ error: error.cause });
    }
  })

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//-------------------------------------------------------------------------------
app.post('/api/auth/refresh',
  async (req, res) => {
    Konsol.log("apigateway /api/auth/refresh", req.body)
    const refreshToken = req.body.refreshToken;
    const sleepDuration = req.body.sleep ?? 0
    if (!refreshToken) return res.sendStatus(401);

    // Do not check for dev !!!
    //if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403); // Si le token n'existe pas en BDD
    if (sleepDuration > 0) {
      await sleep(sleepDuration)
    }
    // Vérification du Refresh Token
    try {

      let decodedToken = new KanbearTokens().checkToken("refresh", refreshToken)
      // Le refresh token est valide, on génère un nouvel access token
      let user0 = new KanbearUser()
      await user0.selectUserById(decodedToken.userId)
      let user = user0.getUser()
      Konsol.log("apigateway /api/auth/refresh refreshToken Ok")
      //let user = (await (new KanbearUser()).selectUserById(decodedToken.userId)).getUser()
      //Konsol.log("apigateway /api/auth/refresh refreshToken user Ok",user)
      let kanbearRights = new KanbearRights(decodedToken.userId).load()
      //Konsol.log("apigateway /api/auth/refresh refreshToken rights Ok")
      const accessToken = new KanbearTokens().generateToken({
        userId: user.userId,
        userName: user.userName,
        isAdmin: user.isAdmin,
        rights: kanbearRights
      });
      Konsol.log("apigateway /api/auth/refresh new accessToken", accessToken)
      res.status(200).json({ accessToken: accessToken });
    } catch (err) {
      Konsol.log("apigateway /api/auth/refresh refreshToken err", err)
      return res.sendStatus(403); // Token invalide ou expiré
    }
  })

//------------------------------------------------------------------------------- 
app.use((req, res, next) => controlToken(req, res, next))

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
app.use('/api/projects_rights', projectRightsRoutes);
app.use('/api/workspaces_rights', workspaceRightsRoutes);


//------------------------------------------------------------------------------
app.get('/api/sql/report/:projectId',
  async (req, res) => {
    const projectId = parseInt(req.params.projectId)
    //console.log("--------------------------------------------------------------------------------------------")
    //Konsol.log("/api/sql/report params", req.params)
    //Konsol.log("/api/sql/report body", req.body)
    //Konsol.log("/api/sql/report query", req.query)
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
Server.init(server, {
  //port: 3003,
  noServer: true,
  clientTracking: true
})
Logger.init('apigateway', `ws://localhost:${PORT}/logger`)




