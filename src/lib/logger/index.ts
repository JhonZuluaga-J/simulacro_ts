
import { ENV } from "@/lib/config/envValidator";

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}


interface logEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
}


class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;

    constructor() {
        this.logLevel = this.getLogLevel();
    }

    private getLogLevel(): LogLevel {
        const envLevel = ENV.LOG_LEVEL;
        switch (envLevel) {
            case "DEBUG":
                return LogLevel.DEBUG;
            case "INFO":
                return LogLevel.INFO;
            case "WARN":
                return LogLevel.WARN;
            case "ERROR":
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }

    private shouldLog(level : LogLevel) : boolean {
        return level >= this.logLevel;
    }
       
    private formatMessage(entry: logEntry): string {
        // todo lo que se ingreza pasa a formato de json string 
        const contextStr = entry.context ? `${JSON.stringify(entry.context)}` : '';
        const timestamp = `${entry.timestamp.replace("T", " ").replace("Z", "")}`; // tiempo en formato legible y global
        return `[${timestamp}] ${LogLevel[entry.level]}: ${entry.message}${contextStr}`;
    }

    private writeLog(
        level: LogLevel,
        message: string,
        context?: Record<string, unknown>
    ):void {
        if (!this.shouldLog(level)) return;

        const entry: logEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
        };

        const formatted = this.formatMessage(entry);

        const loggers: Record<LogLevel, (msg: string) => void> = {
            [LogLevel.DEBUG]: console.log,
            [LogLevel.INFO]: console.log,
            [LogLevel.WARN]: console.warn,
            [LogLevel.ERROR]: console.error,
        };

        loggers[level]?.(formatted);
    }


    public debug(message: string, context?: Record<string, unknown>): void {
        this.writeLog(LogLevel.DEBUG, message, context);
    }

    public info(message: string, context?: Record<string, unknown>): void {
        this.writeLog(LogLevel.INFO, message, context);
    }

    public warn(message: string, context?: Record<string, unknown>): void {
        this.writeLog(LogLevel.WARN, message, context);
    }

    public error(message: string, context?: Record<string, unknown>): void {
        this.writeLog(LogLevel.ERROR, message, context);
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
}

export const logger = Logger.getInstance();
