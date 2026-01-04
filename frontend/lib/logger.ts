import winston from "winston";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack || ""}`;
  }),
);

export const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      level: "info",
      silent: false,
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "combined.log",
      level: "info",
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: "exceptions.log",
      format: fileFormat,
    }),
  ],
});
