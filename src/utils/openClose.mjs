//--------------------------------------------------------------------------------------------
function getOpenCloseSymbol(val) {
    return (val ? "\u{1F513}" : "\u{1F512}")
    //return(val ? '<i class="material-icons">lock</i>':'<i class="material-icons">lock</i>')
}

//--------------------------------------------------------------------------------------------
function getOpenCloseParmBoolean(kind, openSelected, closeSelected) {
    //console.log("getOpenCloseParmBoolean() <kind>", kind, openSelected, closeSelected)
    if (openSelected && closeSelected) {
        //console.log("getOpenCloseParmBoolean() openSelected && closeSelected")
        return(undefined)
    }
    if (openSelected) {
        //console.log("getOpenCloseParmBoolean() openSelected")
        return (true)
    }
    if (closeSelected) {
        //console.log("getOpenCloseParmBoolean() closeSelected")
        return (false)
    }
    //console.log("getOpenCloseParmBoolean() default")
    return(undefined)
}


//--------------------------------------------------------------------------------------------
function getOpenCloseParm(kind, openSelected, closeSelected) {
    //console.log("getOpenCloseParm() <kind>", kind, openSelected, closeSelected)
    if (openSelected && closeSelected) return("")
    if (openSelected) return (`${kind}.open=true`)
    if (closeSelected) return (`${kind}.closed=true`)
    return("")
}

//--------------------------------------------------------------------------------------------
function getOpenCloseQueryParms(kinds=['project', 'swimlane', 'task']) {

    let queries = []
    for (let kind of kinds) {
        const openChecked = document.getElementById(`${kind}Open`).checked
        const closeChecked = document.getElementById(`${kind}Closed`).checked
        const parm = getOpenCloseParm(kind, openChecked, closeChecked)
        if (parm.length > 0) queries.push(parm)
    }

    //console.log("getOpenCloseQueryParms() queries", queries)
    let query = ""
    if (queries.length > 0) {
        query = "?" + queries.join("&")
    }
    //console.log("getOpenCloseQueryParms() query", query)
    return (query)
}

//--------------------------------------------------------------------------------------------


export { getOpenCloseSymbol, getOpenCloseQueryParms, getOpenCloseParmBoolean }