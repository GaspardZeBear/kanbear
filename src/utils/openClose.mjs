function getOpenCloseSymbol(val) {
    return (val ? "\u{1F513}" : "\u{1F512}")
    //return(val ? '<i class="material-icons">lock</i>':'<i class="material-icons">lock</i>')
}

function getOpenCloseParm(kind, openSelected, closeSelected) {
    console.log("getOpenCloseParms() <kind>", kind, openSelected, closeSelected)
    if (openSelected && closeSelected) return("")
    if (openSelected) return (`${kind}.open=true`)
    if (closeSelected) return (`${kind}.closed=true`)
    return("")
}

function getOpenCloseQueryParms(item, openSelected, closeSelected) {

    let queries = []
    for (let kind of ['project', 'swimlane', 'task']) {
        const openChecked = document.getElementById(`${kind}Open`).checked
        const closeChecked = document.getElementById(`${kind}Closed`).checked
        const parm = getOpenCloseParm(kind, openChecked, closeChecked)
        if (parm.length > 0) queries.push(parm)
    }

    console.log("getOpenCloseQueryParms() queries", queries)
    let query = ""
    if (queries.length > 0) {
        query = "?" + queries.join("&")
    }
    console.log("getOpenCloseQueryParms() query", query)
    return (query)
}

export { getOpenCloseSymbol, getOpenCloseQueryParms }