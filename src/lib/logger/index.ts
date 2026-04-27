
import { ENV } from "@/lib/config/envValidator";
 
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
    DEBUG: LogLevel.DEBUG,
    INFO: LogLevel.INFO,
    WARN: LogLevel.WARN,
    ERROR: LogLevel.ERROR,
}

const CONSOLE_METHOD: Record<LogLevel, (msg: string) => void> = {
    [LogLevel.DEBUG]: console.log,
    [LogLevel.INFO]: console.log,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error,
}

const formatTimestamp = (iso: string): string =>
    iso.replace("T", " ").replace("Z", "");

const formatContext = (context?: Record <string, unknown>): string => 
    context ? ` ${JSON.stringify(context)}` : '';

const formatEntry = (entry: LogEntry): string => 
    `[${formatTimestamp(entry.timestamp)}] ${LogLevel[entry.level]}: ${entry.message}${formatContext(entry.context)}`;


class Logger {
    private static instance: Logger;
    private readonly logLevel: LogLevel;

    private constructor()  {
        this.logLevel = LOG_LEVEL_MAP[ENV.LOG_LEVEL] ?? LogLevel.INFO;
    }

    private shouldLog(level : LogLevel) : boolean {
        return level >= this.logLevel;
    }

    private writeLog(
        level: LogLevel,
        message: string,
        context?: Record<string, unknown>
    ):void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
        };

        const formatted = formatEntry(entry);


        CONSOLE_METHOD[level](formatted);
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
