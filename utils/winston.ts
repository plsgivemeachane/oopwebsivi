// const winston = require('winston');
import winston from "winston";
// const path = require('path');
import path from "path";

export const logger = winston.createLogger({
    level: "verbose",
  // format của log được kết hợp thông qua format.combine
    format: winston.format.combine(
        winston.format.splat(),
        // Định dạng time cho log
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        // thêm màu sắc
        winston.format.colorize(),
        // thiết lập định dạng của log
        winston.format.printf((log: any) => {
        // nếu log là error hiển thị stack trace còn không hiển thị message của log
            if (log.stack) return `[${log.timestamp}] [${log.level}]: ${log.stack}`;
            return `<${log.timestamp}> [${log.level}]: ${log.message}`;
        })
    ),
    transports: [
        // hiển thị log thông qua console
        new winston.transports.Console(),
        // Thiết lập ghi các errors vào file
        new winston.transports.File({
            level: "error",
            filename: path.join(__dirname, "errors.log"),
        }),
    ],
});
