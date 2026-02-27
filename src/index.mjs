// Variable globale pour stocker le JSON
import { renderTable } from './report.mjs'
import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanboardListPanel } from './classes/KanboardListPanel.mjs';
let globalJsonData = null;

// Charger un fichier JSON
document.getElementById('loadJson').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3001/api/sql/report');
        globalJsonData = await response.json();
        document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(globalJsonData, null, 2) + '</pre>';
        document.getElementById('message').innerHTML = '<p>Loaded</p>';
    } catch (error) {
        document.getElementById('message').innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
})


//---------------------------------------------------------------------------------
function getFiltersMap() {
    const projectFilter = document.getElementById('projectFilter').value
    const swimlaneFilter = document.getElementById('swimlaneFilter').value
    const taskFilter = document.getElementById('taskFilter').value
    const columnFilter = document.getElementById('columnFilter').value
    const assigneeFilter = document.getElementById('assigneeFilter').value
    return({projectFilter:projectFilter,
        swimlaneFilter,swimlaneFilter,
        taskFilter:taskFilter,
        columnFilter:columnFilter,
        assigneeFilter:assigneeFilter
    })
}

//------------------- showDetails --------------------------------------
document.getElementById('showDetails').addEventListener('click', () => {
    console.log(globalJsonData)
    if (!globalJsonData) {
        document.getElementById('message').innerHTML = '<p style="color: red;">No report loadec</p>';
        return;
    }
    //renderTable(globalJsonData, 'results',getFiltersMap());
    new KanboardListPanel(globalJsonData, 'results',getFiltersMap()).render()
});


// Effacer les données
document.getElementById('clearProjects').addEventListener('click', () => {
    globalJsonData = null;
    document.getElementById('message').textContent = 'No projects loaded';
    document.getElementById('results').innerHTML = '<p></p>';
});



