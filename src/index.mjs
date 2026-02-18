// Variable globale pour stocker le JSON
import { renderTable } from './report.mjs'
let globalJsonData = null;

// Charger un fichier JSON
document.getElementById('loadJson').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3001/api/report');
        globalJsonData = await response.json();

        document.getElementById('results').textContent = JSON.stringify(globalJsonData);
        document.getElementById('message').innerHTML = '<p>Loaded</p>';
    } catch (error) {
        document.getElementById('message').innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
})


// Filtrer le JSON
document.getElementById('filterJson').addEventListener('click', () => {
    if (!globalJsonData) {
        document.getElementById('message').innerHTML = '<p style="color: red;">Aucun JSON chargé.</p>';
        return;
    }

    const keyRegex = new RegExp(document.getElementById('filterKey').value);
    const valueRegex = new RegExp(document.getElementById('filterValue').value);

    const filteredData = filterJson(globalJsonData, keyRegex, valueRegex);
    displayResults(filteredData);
});

// Compter les éléments
document.getElementById('countItems').addEventListener('click', () => {
    if (!globalJsonData) {
        document.getElementById('message').innerHTML = '<p style="color: red;">Aucun JSON chargé.</p>';
        return;
    }

    const count = countItems(globalJsonData);
    document.getElementById('results').innerHTML = `<p>Nombre total d'éléments: ${count}</p>`;
});

// Compter les éléments
document.getElementById('showDetails').addEventListener('click', () => {
    console.log(globalJsonData)
    if (!globalJsonData) {
        document.getElementById('message').innerHTML = '<p style="color: red;">No report loadec</p>';
        return;
    }

    renderTable(globalJsonData, 'results');
    //document.getElementById('results').innerHTML = `<p>Nombre total d'éléments: ${count}</p>`;
});

// Extraire les clés
document.getElementById('extractKeys').addEventListener('click', () => {
    if (!globalJsonData) {
        document.getElementById('message').innerHTML = '<p style="color: red;">Aucun JSON chargé.</p>';
        return;
    }

    const keys = extractKeys(globalJsonData);
    document.getElementById('results').innerHTML = `<p>Clés uniques: ${keys.join(', ')}</p>`;
});

// Effacer les données
document.getElementById('clearData').addEventListener('click', () => {
    globalJsonData = null;
    document.getElementById('message').textContent = 'Aucun fichier JSON chargé.';
    document.getElementById('results').innerHTML = '<p></p>';
});

// Fonction pour filtrer le JSON
function filterJson(data, keyRegex, valueRegex) {
    return data;
}

// Fonction pour compter les éléments
function countItems(data) {
    if (Array.isArray(data)) {
        return data.length;
    } else if (typeof data === 'object') {
        return Object.keys(data).length;
    }
    return 0;
}

// Fonction pour extraire les clés
function extractKeys(data, keys = new Set()) {
    if (Array.isArray(data)) {
        data.forEach(item => extractKeys(item, keys));
    } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => keys.add(key));
        Object.values(data).forEach(value => extractKeys(value, keys));
    }
    return Array.from(keys);
}

