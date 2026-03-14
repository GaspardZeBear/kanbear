import { UnifiedModel } from '../models/UnifiedModel.mjs'

class UnifiedController {

    static getFunction(table, op) {
        console.log("UnifiedController.getFunction called", table, op)
        //UnifiedModel[op](table, op, () => {} )
        return (
            (req, res) => {
                console.log("UnifiedController callback fired table=", table, "op=", op, "req.body=",req.body)
                console.log("UnifiedController callback fired table=", table, "op=", op, "req.params=",req.params)
                UnifiedModel[op](table, req.params, req.body, (err, params) => {
                    console.log(`UnifiedModel workspaces.${op}_${table}() callback function err`, err, 'params (result)','params')
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json(params);
                }

                )
            }
        )
    }

}

export { UnifiedController }