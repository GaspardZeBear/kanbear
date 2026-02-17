// server.js
//const express = require('express');
//const KanboardReporter = require('./kanboardReporter');
import express from 'express'
import { KanboardReporter } from '../classes/KanboardReporter.mjs';
import cors from 'cors';

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

const reporter = new KanboardReporter(
      'http://A6.mshome.net:1961/kanboard-1.2.50/jsonrpc.php',
      'Basic YWRtaW46YWRtaW4='
);

// Rediriger la racine vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.get('/api/report', async (req, res) => {
  try {
    const report = await reporter.getJsonReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port=process.argv[2]
app.listen(parseInt(port), () => {
  console.log('Serveur démarré sur http://localhost:',port);
});
