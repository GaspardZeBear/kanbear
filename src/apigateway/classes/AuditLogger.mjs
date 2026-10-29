import winston from 'winston';

class AuditLogger {
  constructor() {
    if (!AuditLogger.instance) {
      // Configuration interne de Winston
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ 
            filename: 'audit.log',
            maxsize: 5242880, // 5 Mo
            maxFiles: 5
          })
        ]
      });
      
      AuditLogger.instance = this;
    }

    return AuditLogger.instance;
  }

  // Méthode standard pour enregistrer un log d'audit
  log(level, data) {
    this.logger.log(level, data);
  }

  // Raccourci pour les logs de succès/information
  info(data) {
    this.logger.info(data);
  }

  // Raccourci pour les logs d'avertissement / erreurs clients
  warn(data) {
    this.logger.warn(data);
  }

  // Raccourci pour les erreurs critiques
  error(data) {
    this.logger.error(data);
  }
}

// Export d'une instance unique (Singleton)
const auditLogger = new AuditLogger();
export { auditLogger } ;
