import { WinstonModule, type WinstonModuleOptions } from "nest-winston";
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const {  combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, context, timestamp, stack, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const err = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}]${ctx} : ${message}${extra}${err}`;   
});

export const winstonConfig: WinstonModuleOptions ={
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp(),
                errors({ stack: true }),
                consoleFormat
            )
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: combine(
                timestamp(),
                errors({ stack: true }),
                json()
            )
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: combine(
                timestamp(),
                errors({ stack: true }),
                json()
            )
        })
    ]
};

export const bootstrapLogger = WinstonModule.createLogger(winstonConfig);