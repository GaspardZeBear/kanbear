import { Konsol } from 'konsol'
import jwt from 'jsonwebtoken'
//import { KanbearRights } from '../classes/KanbearRights.mjs'
import { AccessRights } from '../classes/AccessRights.mjs'


//------------------------------------------------------------------------------------------------
async function controlToken(req, res, next) {
    try {
        Konsol.log("controlToken() begin")
        let accessRights = new AccessRights(req, res)
        Konsol.log("controlToken() accesssRight init done")
        if (!accessRights.checkToken()) {
            // Si non autorisé, renvoie une erreur 401
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access denied'
            });
        }
        accessRights.setKanbearKontext()
        next()
    } catch (err) {
        console.log(err)
        Konsol.log('controlToken error', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error when checking token.'
        });
    }
}


//--------------------------------------------------------------------------------------------------
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export { controlToken }