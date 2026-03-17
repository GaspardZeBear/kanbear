// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanboardListPanel } from './classes/KanboardListPanel.mjs';
import { KanbearMigrator } from './classes/KanbearMigrator.mjs';
import { Kontext } from './classes/Kontext.mjs';

await Kontext.loadConfig()
buildProjectsSelectBox()

document.getElementById('kanboard').href = Kontext.getKanboardUrl()

document.getElementById('projectsSelectBox').addEventListener('change', (e) => {
    const selectedProject = e.target.value;
    console.log("projectSelectBox", e.target.value)
    Kontext.setProject(selectedProject, "xxxx")
});

document.getElementById('loadJson').addEventListener('click', async () => {
    try {
        const response = await Kontext.loadJsonBulkData()
        document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(Kontext.getJsonBulkData(), null, 2) + '</pre>';
        document.getElementById('message').innerHTML = '<p>Loaded</p>';
    } catch (error) {
        document.getElementById('message').innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
})

//---------------------------------------------------------------------------------
async function buildProjectsSelectBox() {
    await Kontext.loadProjects()
    //const option = document.createElement('option')
    //option.setAttribute("value", 0)
    //option.innerHTML = '-------'
    //document.getElementById('projectsSelectBox').appendChild(option)
    Object.entries(Kontext.getProjects()).forEach(([pId, pName],idx) => {
        console.log(idx,pId, pName)
        
        const option = document.createElement('option')
        if ( idx == 0) {
            Kontext.setProject(pId,pName)
            option.setAttribute("selected","selected")
        }
        option.setAttribute("value", pId)
        option.innerHTML = pName
        document.getElementById('projectsSelectBox').appendChild(option)
    })
}

//---------------------------------------------------------------------------------
function getFiltersMap() {
    const projectFilter = document.getElementById('projectFilter').value
    const swimlaneFilter = document.getElementById('swimlaneFilter').value
    const taskFilter = document.getElementById('taskFilter').value
    const columnFilter = document.getElementById('columnFilter').value
    const assigneeFilter = document.getElementById('assigneeFilter').value
    return ({
        projectFilter: projectFilter,
        swimlaneFilter, swimlaneFilter,
        taskFilter: taskFilter,
        columnFilter: columnFilter,
        assigneeFilter: assigneeFilter
    })
}


//------------------- migrate from kanboard to kanbear --------------------------------------
document.getElementById('migrate').addEventListener('click', () => {
    new KanbearMigrator('results', getFiltersMap()).migrate()
});


//------------------- showDetails --------------------------------------
document.getElementById('showDetails').addEventListener('click', () => {
    new KanboardListPanel('results', getFiltersMap()).render()
});

//------------------- kanban --------------------------------------
document.getElementById('kanban').addEventListener('click', () => {
    new KanbanPanel('results', getFiltersMap()).render()
});


// Effacer les données
document.getElementById('clearProjects').addEventListener('click', () => {
    globalJsonData = null;
    document.getElementById('message').textContent = 'No projects loaded';
    document.getElementById('results').innerHTML = '<p></p>';
});



