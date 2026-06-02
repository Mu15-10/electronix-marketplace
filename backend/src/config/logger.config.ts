import { createLogger, format, transports } from 'winston';
import { join } from 'path';

const logDir = join(__dirname, '..', '..', 'logs');

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: 'electronix-marketplace' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? `[${context}]` : '';
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
        }),
      ),
    }),
    new transports.File({
      filename: join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 10,
    }),
    new transports.File({
      filename: join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});

export class LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: string, meta?: Record<string, unknown>) {
    logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, trace?: string, meta?: Record<string, unknown>) {
    logger.error(message, { context: this.context, trace, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>) {
    logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, meta?: Record<string, unknown>) {
    logger.debug(message, { context: this.context, ...meta });
  }

  verbose(message: string, meta?: Record<string, unknown>) {
    logger.verbose(message, { context: this.context, ...meta });
  }
}
