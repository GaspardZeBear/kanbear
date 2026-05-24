import { Project } from './Project.mjs'
import { KanbanPanel } from './KanbanPanel.mjs'
import { KanbearListPanel } from "./KanbearListPanel.mjs"
import { sendMessage, sendErrorMessage } from '../utils/sendMessage.mjs'
import { getOpenCloseSymbol, getOpenCloseQueryParms } from '../utils/openClose.mjs'
import axios from 'axios';

class Kontext {

    static jsonBulkData
    static kanboardJsonBulkData
    static kanbearConfig
    static projects
    static kanboardProjects
    static currentProject
    static currentProjectId
    static currentProjectName
    static workspaceId
    static workspaceName
    static panelClass


    //--------------------------------------------------------------
    static async loadConfig() {
        const config = await fetch('/kanbearConfig.json')
        Kontext.kanbearConfig = await config.json();
        console.log(Kontext.kanbearConfig)
    }
    //--------------------------------------------------------------
    static async setProject(projectId) {
        Kontext.currentProjectId = projectId
        if (projectId < 1) {
            Kontext.resetKanbearJsonBulkData()
            return
        }
        //Kontext.currentProjectName=projectName[]
        //Kontext.currentProjectName=projectName
        console.log("Kontext setProject() bulk ", Kontext.currentProjectId)
        await Kontext.loadKanbearJsonBulkData()
        console.log("Kontext setProject() after bulk ", Kontext.jsonBulkData)
        Kontext.currentProjectName = Kontext.jsonBulkData[projectId].name
        //await Kontext.loadKanboardJsonBulkData()
    }

    //--------------------------------------------------------------
    static getProjects() {
        return (Kontext.projects)
    }

    //--------------------------------------------------------------
    static getCurrentProject() {
        console.log("Kontext getCurrentProject() ", Kontext.currentProjectId)
        return (Kontext.jsonBulkData[Kontext.currentProjectId])
    }

    //--------------------------------------------------------------
    static setPanelClass(panelClass) {
        Kontext.panelClass = panelClass
    }

    //--------------------------------------------------------------
    static getPanelClass() {
        return (Kontext.panelClass)
    }

    //--------------------------------------------------------------
    static async renderPanel() {
        if (Kontext.panelClass) {
            console.log("Kontext.renderPanel panelClass", Kontext.panelClass)
            let panel = await Kontext.panelClass.builder()
            console.log("Kontext.renderPanel panel", panel)
            panel.render()
        }
    }

    //--------------------------------------------------------------
    static getCurrentProjectId() {
        console.log("Kontext getCurrentProjectId() ", Kontext.currentProjectId)
        return (Kontext.currentProjectId)
    }

    //--------------------------------------------------------------
    static getCurrentProjectName() {
        console.log("Kontext getCurrentProjectName() ", Kontext.currentProjectName)
        return (Kontext.currentProjectName)
    }

    //--------------------------------------------------------------
    static getKanboardUrl() {
        return (`${Kontext.kanbearConfig.kanboard.url}:${Kontext.kanbearConfig.kanboard.port}/${Kontext.kanbearConfig.kanboard.uri}`)
    }

    //--------------------------------------------------------------
    static getKanbearUrl() {
        return (`${Kontext.kanbearConfig.kanbear.url}:${Kontext.kanbearConfig.kanbear.port}`)
    }

    //--------------------------------------------------------------
    static getGatewayUrl() {
        return (`${Kontext.kanbearConfig.gateway.url}:${Kontext.kanbearConfig.gateway.port}`)
    }

    //--------------------------------------------------------------
    static getJsonBulkData() {
        return (Kontext.jsonBulkData)
    }

    //--------------------------------------------------------------
    static setWorkspaceId(id) {
        Kontext.workspaceId = id
    }

    //--------------------------------------------------------------
    static setWorkspaceName(name) {
        Kontext.workspaceName = name
    }
    //--------------------------------------------------------------
    static getWorkspaceId() {
        return (Kontext.workspaceId)
    }

    //--------------------------------------------------------------
    static getWorkspaceName() {
        return (Kontext.workspaceName)
    }


    //--------------------------------------------------------------
    static getProjectConfig(pName) {
        return (Kontext.kanbearConfig.projects[pName])
    }

    //--------------------------------------------------------------
    static getProjectStyle(pName) {
        console.log("pName", pName)
        let style = "background-color:yellow"
        return (Kontext.kanbearConfig.projects[pName]?.style ?? style)
    }

    //--------------------------------------------------------------
    static async loadKanbearJsonBulkData(parms = { useKontext: true, projectId: null }) {
        try {
  
            // Do not take in account project open or closed !!!!
            let query = getOpenCloseQueryParms(['swimlane', 'task'])
            let projectId = parms.useKontext ? Kontext.currentProjectId : parms.projectId
            if ( projectId === undefined ) {
                console.log("Kontext.loadKanbearJsonBulkData() from kanbear projectId is undefined")
                return({})
            }

            const url = `${Kontext.getKanbearUrl()}/api/sql/report/${projectId}${query}`
            console.log("Kontext.loadKanbearJsonBulkData() from kanbear", url)
            //const response = await fetch(url);
            const response = await axios.get(url);
            console.log(response)

            //if (!response.ok) {
            if (response.statusText != "OK") {
                throw new Error(`Kontext.loadKanbearJsonBulkData() error ${response.message}`)
            }
            //const resp = await response.json();
            const resp = await response.data;
            console.log("Kontext.loadKanbearJsonBulkData() from updated loaded", resp)
            if (parms.useKontext) {
                Kontext.jsonBulkData = resp
            }

            sendMessage("Project loaded")
            return (resp)
        } catch (error) {
            sendErrorMessage(`Could not  load project ${Kontext.currentProjectId}`)
            console.log(`Kontext.loadKanbearJsonBulkData() error ",error`)
            throw new Error(`Kontext.loadKanbearJsonBulkData() error ${error.message}`)
        }
    }
    //--------------------------------------------------------------
    static async resetKanbearJsonBulkData() {
        try {
            Kontext.jsonBulkData = {}
            //Kontext.currentProject = Kontext.jsonBulkData
            Kontext.currentProjectId = undefined
            Kontext.currentProjectName = undefined
            console.log("Kontext.resetKanbearJsonBulkData() done", Kontext.jsonBulkData)
        } catch (error) {
            throw new Error(`Kontext.resetKanbearJsonBulkData() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async loadKanbearProjects() {
        try {
            //const url=`${Kontext.getGatewayUrl()}/api/sql/loadProjects`
            //console.log(url)
            //const response = await fetch(url);
            Kontext.projects = await Project.getAll('projects', { workspace_id: Kontext.workspaceId })
            console.log("loadProjects() ", Kontext.projects)
            //Kontext.projects = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadProjects() error ${error.message}`)
        }
    }
    //--------------------------------------------------------------
    static async loadKanboardJsonBulkData(id) {
        try {
            //const url=`${Kontext.getGatewayUrl()}/api/sql/report/${Kontext.currentProjectId}`
            const url = `${Kontext.getGatewayUrl()}/api/sql/report/${id}`
            console.log("Kontext.loadKanboardJsonBulkData() from kanboard", url)
            const response = await fetch(url);
            Kontext.kanboardJsonBulkData = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadKanboardJsonBulkData() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async loadKanboardProjects() {
        try {
            const url = `${Kontext.getGatewayUrl()}/api/sql/loadProjects`
            console.log(url)
            //const response = await fetch(url);
            const response = await axios.get(url);
            //Kontext.kanboardProjects = await response.json();
            Kontext.kanboardProjects = response.data;
        } catch (error) {
            throw new Error(`Kontext.loadProjects() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async getKanboardProjectById(id) {
        console.log("Kontext getKanboardProject() <id> ", id)
        await this.loadKanboardJsonBulkData(id)
        console.log("Kontext getKanboardProject() <bulk> ", Kontext.kanboardJsonBulkData)
        return (Kontext.kanboardJsonBulkData[id])
    }
}

export { Kontext } 
