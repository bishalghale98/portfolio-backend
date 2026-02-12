/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with timestamps and log levels
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogOptions {
    level: LogLevel;
    message: string;
    data?: any;
}

/**
 * Get color code for log level
 */
const getColorCode = (level: LogLevel): string => {
    const colors = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m',   // Magenta
        success: '\x1b[32m', // Green
    };
    return colors[level] || '\x1b[0m';
};

/**
 * Get emoji for log level
 */
const getEmoji = (level: LogLevel): string => {
    const emojis = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🔍',
        success: '✅',
    };
    return emojis[level] || '';
};

/**
 * Format log message with timestamp and level
 */
const formatLog = ({ level, message, data }: LogOptions): string => {
    const timestamp = new Date().toISOString();
    const colorCode = getColorCode(level);
    const emoji = getEmoji(level);
    const reset = '\x1b[0m';

    let logMessage = `${colorCode}[${timestamp}] ${emoji} ${level.toUpperCase()}: ${message}${reset}`;

    if (data) {
        logMessage += `\n${colorCode}${JSON.stringify(data, null, 2)}${reset}`;
    }

    return logMessage;
};

/**
 * Logger class with different log levels
 */
class Logger {
    /**
     * Log info message
     */
    info(message: string, data?: any): void {
        console.log(formatLog({ level: 'info', message, data }));
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: any): void {
        console.warn(formatLog({ level: 'warn', message, data }));
    }

    /**
     * Log error message
     */
    error(message: string, data?: any): void {
        console.error(formatLog({ level: 'error', message, data }));
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(formatLog({ level: 'debug', message, data }));
        }
    }

    /**
     * Log success message
     */
    success(message: string, data?: any): void {
        console.log(formatLog({ level: 'success', message, data }));
    }
}

// Export singleton logger instance
export const logger = new Logger();
