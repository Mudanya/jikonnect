
import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

// Log directory
const isVercel = process.env.VERCEL === '1';

const logDir = isVercel ? '/tmp/logs' : path.join(process.cwd(), 'logs');

// const logDir = path.join(process.cwd(), "logs");

// Daily rotate transport
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "%DATE%.log"), // e.g. logs/2025-11-07.log
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxFiles: "14d", // Keep logs for 14 days
  level: "info",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    dailyRotateFileTransport,
  ],
});

export default logger;
