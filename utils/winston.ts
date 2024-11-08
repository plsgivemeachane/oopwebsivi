// const winston = require('winston');
import winston from "winston";
// const path = require('path');
import path from "path";

const options = {
    console: {
        handleExceptions: true,
        level: 'debug',
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.colorize(),
            winston.format.printf((log: any) => {
                if (log.stack) return `[${log.timestamp}] [${log.level}]: ${log.stack}`;
                return `<${log.timestamp}> [${log.level}]: ${log.message}`;
            })
        ),
    },
    file: {
        level: 'info',
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.printf((log: any) => {
                if (log.stack) return `[${log.timestamp}] [${log.level}]: ${log.stack}`;
                return `<${log.timestamp}> [${log.level}]: ${log.message}`;
            })
        ),
        filename: path.join(__dirname, "info.log")
    }
}

export const logger = winston.createLogger({
    level: "verbose",
    transports: [
        new winston.transports.Console(options.console),
        new winston.transports.File(options.file),
    ],
});
