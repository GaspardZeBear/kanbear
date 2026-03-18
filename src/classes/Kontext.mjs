class Kontext {

    static jsonBulkData
    static kanbearConfig
    static projects
    static currentProjectId
    static currentProjectName

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
        await Kontext.loadJsonBulkData()
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
    static async loadJsonBulkData() {
        try {
            const url=`${Kontext.getGatewayUrl()}/api/sql/report/${Kontext.currentProjectId}`
            console.log("Kontext.loadJsonBulkData()",url)
            const response = await fetch(url);
            Kontext.jsonBulkData = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadJsonBulkData() error ${error.message}`)
        }
    }

    //--------------------------------------------------------------
    static async loadProjects() {
        try {
            const url=`${Kontext.getGatewayUrl()}/api/sql/loadProjects`
            console.log(url)
            const response = await fetch(url);
            Kontext.projects = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadProjects() error ${error.message}`)
        }
    }
}

export { Kontext } 
