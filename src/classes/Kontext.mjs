class Kontext {

    static jsonBulkData
    static kanboardConfig

    //--------------------------------------------------------------
    static async loadConfig() {
        const config = await fetch('/kanbearConfig.json')
        Kontext.kanboardConfig = await config.json();
        console.log(Kontext.kanboardConfig)
    }

    //--------------------------------------------------------------
    static getKanboardUrl() {
        return(`${Kontext.kanboardConfig.kanboard.url}:${Kontext.kanboardConfig.kanboard.port}/${Kontext.kanboardConfig.kanboard.uri}`)
    }

    
    //--------------------------------------------------------------
    static getGatewayUrl() {
        return(`${Kontext.kanboardConfig.gateway.url}:${Kontext.kanboardConfig.gateway.port}`)
    }

    //--------------------------------------------------------------
    static getJsonBulkData() {
        return (Kontext.jsonBulkData)
    }

    //--------------------------------------------------------------
    static getProject(pName) {
        return (Kontext.kanboardConfig.projects[pName])
    }

    //--------------------------------------------------------------
    static getProjectStyle(pName) {
        console.log("pName",pName)
        let style="background-color:yellow"
        return ( Kontext.kanboardConfig.projects[pName] ?.style ?? style)
    }


    //--------------------------------------------------------------
    static async loadJsonBulkData() {
        try {
            const url=`${Kontext.getGatewayUrl()}/api/sql/report`
            console.log(url)
            const response = await fetch(url);
            Kontext.jsonBulkData = await response.json();
        } catch (error) {
            throw new Error(`Kontext.loadJsonBulkData() error ${error.message}`)
        }
    }
}

export { Kontext } 