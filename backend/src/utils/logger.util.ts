import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context }) => {
        return `${timestamp} [${level}]${context ? ' [' + context + ']' : ''} : ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export function log( level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: string) {
  switch (level) {
    case 'info':
      logger.info(message, { context });
      break;
    case 'warn':
      logger.warn(message, { context });
      break;
    case 'error':
      logger.error(message, { context });
      break;
    case 'debug':
      logger.debug(message, { context });
      break;
  }
}

export default logger;