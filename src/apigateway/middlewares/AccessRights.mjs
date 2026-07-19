import { Konsol } from 'konsol'
import jwt from 'jsonwebtoken'

async function controlAccessRights(req, res, next) {
    try {
        Konsol.log("controlAccessRights")
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
        Konsol.log('Erreur dans authMiddleware:', err);
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
        Konsol.log("AccessRights constructor()")
        this.req = req
        this.res = res
    }

    async check() {
        Konsol.log("AccessRights control()", this.req.headers)
        Konsol.log("AccessRights control() url baseUrl", this.req.baseUrl)
        Konsol.log("AccessRights control() url originalreq", this.req.originalUrl)
        Konsol.log("AccessRights control() url method", this.req.method)
        Konsol.log("AccessRights control() params", this.req.params)
        Konsol.log("AccessRights control() body", this.req.body)
        Konsol.log("AccessRights control() query", this.req.query)
        await sleep(2500)
        const token = this.req.headers['authorization'];
        Konsol.log("AccessRights control() token", token)
        return(true)
    }

    async Xcheck() {
        Konsol.log("AccessRights control()", this.req.headers)
        Konsol.log("AccessRights control() url baseUrl", this.req.baseUrl)
        Konsol.log("AccessRights control() url originalreq", this.req.originalUrl)
        Konsol.log("AccessRights control() url method", this.req.method)
        Konsol.log("AccessRights control() params", this.req.params)
        Konsol.log("AccessRights control() body", this.req.body)
        Konsol.log("AccessRights control() query", this.req.query)
        //await sleep(2500)
        const token = this.req.headers['authorization'];
                return(true)

        if (!token) {
            //return res.status(401).json({ message: 'No token' });
            return(false)
        }

        try {
            Konsol.log(jwt.verify(token, 'kanbear'))
            next();
        } catch (e) {
            this.res.status(401).json({ message: 'Token invalide.' });
        }
        return (true)
    }

}

export { controlAccessRights }