// server.js
//const express = require('express');
//const KanboardReporter = require('./kanboardReporter');
import express from 'express'
import { KanboardReporter } from '../classes/KanboardReporter.mjs';
import { KanboardSqlReporter } from '../classes/KanboardSqlReporter.mjs';
import cors from 'cors';
import fs from 'fs'

//const cors = require('cors');

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());


// Récupérer le chemin du répertoire courant
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, '')));
app.use(cors());
app.use(express.json());

const configFile=process.argv[2]

const config=JSON.parse(fs.readFileSync('../../kanbearConfig.json'))
console.log(config)
const port=config.gateway.port

const reporter = new KanboardReporter(
      'http://A6.mshome.net:1961/kanboard-1.2.50/jsonrpc.php',
      'Basic YWRtaW46YWRtaW4='
);
const sqlReporter = new KanboardSqlReporter(
      config.sqliteFile,false
      );

// Rediriger la racine vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

//------------------------------------------------------------------------------
app.get('/api/sql/report/:projectId', async (req, res) => {
  const projectId=parseInt(req.params.projectId)
   console.log("/api/sql/report invokated pId",projectId)
  try {
    const report = await sqlReporter.getJsonReport(projectId);
    console.log("api.get() ", report)
    res.json(report);
  } catch (error) {
     console.log("/api/sql/report error ",error.message )
    res.status(500).json({ error: error.message });
  }
   console.log("/api/sql/report done")
});

//------------------------------------------------------------------------------
app.get('/api/sql/loadProjects', async (req, res) => {
   console.log("/api/sql/loadProjects invokated")
  try {
    const report = await sqlReporter.loadProjects();
    console.log("api.get() ", report)
    res.json(report);
  } catch (error) {
     console.log("/api/sql/loadProjects error ",error.message )
    res.status(500).json({ error: error.message });
  }
   console.log("/api/sql/loadProjects done")
});

//------------------------------------------------------------------------------
app.get('/api/report', async (req, res) => {
  try {
    const report = await reporter.getJsonReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//const port=process.argv[2]
app.listen(parseInt(port), () => {
  console.log('RPCGateway  http://localhost:',port);
});
