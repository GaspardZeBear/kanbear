import { auditLogger } from '../classes/AuditLogger.mjs'

const auditMiddleware = (req, res, next) => {
  // L'événement 'finish' garantit que la réponse a été envoyée au client
  res.on('finish', () => {
    // Filtre pour ne garder que les actions de modification (Audit)
    const methodsToLog = ['GET','POST', 'PUT', 'DELETE', 'PATCH'];

    if (methodsToLog.includes(req.method)) {
      const statusCode = res.statusCode;
      /*
      console.log("req.action",`${req.method}_${req.baseUrl}${req.path}`)
      console.log("req.body",req.body ?? "no body")
      console.log("req.params=", req.params?? "no params")
      console.log("req.query=", req.query?? "no query")
      console.log("req.kanbearKontext=", req.kanbearKontext ?? "no kanbearKontext")
      */
      let data= {
        body : req.body ?? {},
        params : req.params ?? {},
        query : req.query ?? {}
      }
     
      
      // Construction stricte de l'objet de réponse d'audit
      const auditLog = {
        timestamp: new Date().toISOString(),
        level: statusCode >= 400 ? 'warn' : 'info',
        category: 'AUDIT_HTTP',
        actor: {
          userId: req?.kanbearKontext?.decodedToken?.userName ??  'ANONYMOUS', // ID utilisateur si authentifié
        },
        action: `${req.method}_${req.baseUrl}${req.path}`,
        data : data,
        statusCode: statusCode,
        status: statusCode >= 400 ? 'FAILURE' : 'SUCCESS'
      };

      // Si c'est une erreur, on peut ajouter le message d'erreur s'il est disponible
      if (statusCode >= 400 && res.statusMessage) {
        auditLog.meta = { error: res.statusMessage };
      }

      // Envoi direct au logger Winston
      auditLogger.log(auditLog.level, auditLog);
    }
  });

  next();
};

export { auditMiddleware }