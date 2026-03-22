import { Project } from './Project.mjs'

class Kontext {

    static jsonBulkData
    static kanboardJsonBulkData
    static kanbearConfig
    static projects
    static kanboardProjects
    static currentProjectId
    static currentProjectName
    static workspaceId


    //--------------------------------------------------------------
    static async loadConfig() {
        const config = await fetch('/kanbearConfig.json')
        Kontext.kanbearConfig = await config.json();
        console.log(Kontext.kanbearConfig)
    }
//--------------------------------------------------------------
    static async setProject(projectId,projectName) {
        Kontext.currentProjectId=projectId
        Kontext.currentProjectName=projectName
        console.log("Kontext setProject() bulk ",Kontext.currentProjectId," ",Kontext.currentProjectName)
        await Kontext.loadKanbearJsonBulkData()
        //await Kontext.loadKanboardJsonBulkData()
    }

    //--------------------------------------------------------------
    static getProjects() {
        return(Kontext.projects)
    }

//--------------------------------------------------------------
    static getCurrentProject() {
        console.log("Kontext getCurrentProject() ",Kontext.currentProjectId)
        return(Kontext.jsonBulkData[Kontext.currentProjectId])
    }

    //--------------------------------------------------------------
    static getCurrentProjectId() {
        console.log("Kontext getCurrentProjectId() ",Kontext.currentProjectId)
        return(Kontext.currentProjectId)
    }

    //--------------------------------------------------------------
    static getKanboardUrl() {
        return(`${Kontext.kanbearConfig.kanboard.url}:${Kontext.kanbearConfig.kanboard.port}/${Kontext.kanbearConfig.kanboard.uri}`)
    }

    //--------------------------------------------------------------
    static getKanbearUrl() {
        return(`${Kontext.kanbearConfig.kanbear.url}:${Kontext.kanbearConfig.kanbear.port}`)
    }

        //--------------------------------------------------------------
    static getGatewayUrl() {
        return(`${Kontext.kanbearConfig.gateway.url}:${Kontext.kanbearConfig.gateway.port}`)
    }

    //--------------------------------------------------------------
    static getJsonBulkData() {
        return (Kontext.jsonBulkData)
    }

    //--------------------------------------------------------------
    static setWorkspaceId(id) {
        Kontext.workspaceId=id
    }

    //--------------------------------------------------------------
    static getWorkspaceId(id) {
        return (Kontext.workspaceId)
    }

    //--------------------------------------------------------------
    static getProjectConfig(pName) {
        return (Kontext.kanbearConfig.projects[pName])
    }

    //--------------------------------------------------------------
    static getProjectStyle(pName) {
        console.log("pName",pName)
        let style="background-color:yellow"
        return ( Kontext.kanbearConfig.projects[pName] ?.style ?? style)
    }

    //--------------------------------------------------------------
    static async loadKanbearJsonBulkData() {
        try {
            const url=`${Kontext.getKanbearUrl()}/api/sql/report/${Kontext.currentProjectId}`
            console.log("Kontext.loadKanbearJsonBulkData() from kanbear",url)
            const response = await fetch(url);
            Kontext.jsonBulkData = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadKanbearJsonBulkData() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async loadKanbearProjects() {
        try {
            //const url=`${Kontext.getGatewayUrl()}/api/sql/loadProjects`
            //console.log(url)
            //const response = await fetch(url);
            Kontext.projects=await Project.getAll('projects',{workspace_id:Kontext.workspaceId})
            console.log("loadProjects() ",Kontext.projects)
            //Kontext.projects = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadProjects() error ${error.message}`)
        }
    }
    //--------------------------------------------------------------
    static async loadKanboardJsonBulkData(id) {
        try {
            //const url=`${Kontext.getGatewayUrl()}/api/sql/report/${Kontext.currentProjectId}`
            const url=`${Kontext.getGatewayUrl()}/api/sql/report/${id}`
            console.log("Kontext.loadKanboardJsonBulkData() from kanboard",url)
            const response = await fetch(url);
            Kontext.kanboardJsonBulkData = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadKanboardJsonBulkData() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async loadKanboardProjects() {
        try {
            const url=`${Kontext.getGatewayUrl()}/api/sql/loadProjects`
            console.log(url)
            const response = await fetch(url);
            Kontext.kanboardProjects = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadProjects() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async getKanboardProjectById(id) {
        console.log("Kontext getKanboardProject() <id> ",id)
        await this.loadKanboardJsonBulkData(id)
        console.log("Kontext getKanboardProject() <bulk> ",Kontext.kanboardJsonBulkData)
        return(Kontext.kanboardJsonBulkData[id])
    }
}

export { Kontext } 
