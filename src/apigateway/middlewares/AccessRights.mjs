import { Konsol } from 'konsol'
import jwt from 'jsonwebtoken'
import { KanbearRights } from '../classes/KanbearRights.mjs'

async function controlAccessRights(req, res, next) {
    try {
        //Konsol.log("controlAccessRights")
        let accessRights = new AccessRights(req, res)

        if (!await accessRights.check()) {
            // Si non autorisé, renvoie une erreur 401
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access denied'
            });
        }
        next()
    } catch (err) {
        //Konsol.log('Erreur dans authMiddleware:', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error when checking rights.'
        });
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}



class AccessRights {

    constructor(req, res) {
        //Konsol.log("AccessRights constructor()")
        this.req = req
        this.res = res
    }

    async check() {
        //Konsol.log("AccessRights control()", this.req.headers)
            //Konsol.log("AccessRights control() url baseUrl", this.req.baseUrl)
            //Konsol.log("AccessRights control() url originalreq", this.req.originalUrl)
            //Konsol.log("AccessRights control() url method", this.req.method)
            //Konsol.log("AccessRights control() params", this.req.params)
            //Konsol.log("AccessRights control() body", this.req.body)
            // Konsol.log("AccessRights control() query", this.req.query)
        //await sleep(2500)
        const token = this.req.headers['authorization'];
        if (!token) {
            //this.res.status(401).json({ message: 'No token' });
            return (false)
        }
        const decoded = jwt.verify(token, 'kanbear')
        //Konsol.log("AccessRights check() token", JSON.stringify(decoded))
        //return (false)
        //
        try {
            //Konsol.log("AccessRights check() token.userId", decoded.userId)
            let kanbearRights=new KanbearRights(decoded.userId)
            let isAdmin = await kanbearRights.isAdmin()
            console.log("isAdmin",isAdmin)
            let rights={}
            if (isAdmin == 0) {
                rights = await kanbearRights.load()
                rights.isAdmin = 0
            }  else {
                rights.isAdmin = 1
            }
            
            this.req.kanbearKontext = {
                token: decoded,
                rights: rights
            }
            return (true)
        } catch (e) {
            console.log(e)
            Konsol.log("AccessRights check()", "error", e)
            //this.res.status(401).json({ message: 'Token invalide.' });
            return (false)
        }
    }

    async loadRights(userId) {
    }

}

export { controlAccessRights }