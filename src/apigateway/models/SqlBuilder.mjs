class SqlBuilder {

    //----------------------------------------------------------------------------------
    generatePatchStatement(tableName, id, updates) {
        const setClauses = []
        const bindVariables = []
        Object.entries(updates).forEach(([key, val]) => {
            setClauses.push(`${key}=?`)
            bindVariables.push(val)
        })
        const setClausesStr = setClauses.join(', ');
        const sql = `UPDATE ${tableName} SET ${setClausesStr} WHERE id=${id}`;
        return { sql, bindVariables };
    }

    //----------------------------------------------------------------------------------
    generateDeleteStatement(tableName, id) {
        const setClauses = []
        const bindVariables = []
        Object.entries(updates).forEach(([key, val]) => {
            setClauses.push(`${key}=?`)
            bindVariables.push(val)
        })
        const setClausesStr = setClauses.join(', ');
        const sql = `DELETE FROM ${tableName} WHERE id=${id}`;
        return { sql, bindVariables };
    }

    //----------------------------------------------------------------------------------
    generateCreateStatement(tableName, inserts) {
        const setClauses = []
        const bindVariables = []
        const qmarks = []
        Object.entries(inserts).forEach(([key, val]) => {
            setClauses.push(`${key}`)
            qmarks.push('?')
            bindVariables.push(val)
        })

        const setClausesStr = setClauses.join(', ');
        const qmarksStr = qmarks.join(', ');
        const sql = `INSERT INTO  ${tableName} (${setClausesStr}) VALUES (${qmarksStr})`;
        return { sql, bindVariables };
    }


    //----------------------------------------------------------------------------------
    generateGetStatement(tableName, req) {
        const setClauses = []
        const bindVariables = []
        const qmarks = []
        const filter = req.query ?? {}
        console.log("req.query", req.query)
        // quick and darty, does not work for strings !
        let whereStr = ''
        if (req.query && req.query.filter) {
            if (Array.isArray(req.query.filter)) {
                whereStr = req.query.filter.join(' AND ')
            } else {
                whereStr = req.query.filter
            }
        }
        const qmarksStr = qmarks.join(', ');
        console.log(whereStr)
        whereStr ? whereStr = 'WHERE ' + whereStr : ''
        const sql = `SELECT * FROM ${tableName} ${whereStr}`;
        //const sql = `INSERT INTO  ${tableName} (${setClausesStr}) VALUES (${qmarksStr})`;
        return { sql, bindVariables };
    }
}

export { SqlBuilder }