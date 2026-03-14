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
    generateCreateStatement(tableName, inserts) {
        const setClauses = []
        const bindVariables = []
        const qmarks=[]
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
}

export { SqlBuilder }