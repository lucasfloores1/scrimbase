import { LoggerService } from '@nestjs/common';
import logger from './logger.util';

export class WinstonAdapter implements LoggerService {
  log(message: string, context?: string) {
    logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    logger.error(`${message}${trace ? `\n${trace}` : ''}`, { context });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  debug?(message: string, context?: string) {
    logger.debug(message, { context });
  }

  verbose?(message: string, context?: string) {
    logger.info(message, { context }); // verbose lo tratamos como info
  }
}