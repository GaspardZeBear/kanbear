class SqlBuilder {

    /**
 * Génère un prepared statement SQL UPDATE et les valeurs associées
 * à partir des champs présents dans req.body.
 * @param {string} tableName - Nom de la table à mettre à jour.
 * @param {Object} updates - Objet contenant les champs à mettre à jour (req.body).
 * @param {string} idColumn - Nom de la colonne d'ID (ex: 'id').
 * @param {number|string} idValue - Valeur de l'ID.
 * @returns {Object} - { sql: string, params: Array } - Requête SQL et paramètres.
 */
    //generatePatchStatement(tableName, updates, idColumn, idValue) {
    generatePatchStatement(tableName, id, updates) {
        // Filtrer les champs vides ou non définis
        //console.log(updates)
        const setClauses = []
        const params = []
        const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
        Object.entries(updates).forEach(([key, val]) => {
            setClauses.push(`${key}=?`)
            params.push(val)
        })

        // Construire la partie SET de la requête (ex: "name = ?, description = ?")
        const setClausesStr = setClauses.join(', ');
        const sql = `UPDATE ${tableName} SET ${setClausesStr} WHERE id=${id}`;
        //console.log(sql)
        // Construire le tableau des paramètres (valeurs + ID)
        //console.log(params)
        return { sql, params };
    }
}

export { SqlBuilder }