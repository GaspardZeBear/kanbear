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
    generateDeleteStatement(tableName, req) {
        const setClauses = []
        const bindVariables = []
        const setClausesStr = setClauses.join(', ');
        const sql = `DELETE FROM ${tableName} WHERE id=${req.params.id}`;
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
        console.log("SqlBuilder.generateGetStatement() <req.query>", req.query, "<req.params>",req.params,"<filter>", filter)
        // quick and darty, does not work for strings !
        let filters = []
        Object.entries(filter).forEach(([key, val]) => {
            filters.push(`${key}=${val}`)
        })
        /*
        let whereStr = ''
        if (req.query && filter) {
            if (Array.isArray(filter)) {
                whereStr = filter.join(' AND ')
            } else {
                whereStr = filter
            }
        }
        */
        let whereStr = filters.join(' AND ')
        whereStr ? whereStr = 'WHERE ' + whereStr : ''

        const qmarksStr = qmarks.join(', ');
        console.log("SqlBuilder.generateGetStatement() <whereStr>", whereStr)

        const sql = `SELECT * FROM ${tableName} ${whereStr}`;
        //const sql = `INSERT INTO  ${tableName} (${setClausesStr}) VALUES (${qmarksStr})`;
        return { sql, bindVariables };
    }
}

export { SqlBuilder }