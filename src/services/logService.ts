/**
 * Log levels for the application
 */
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Configuration for the logger
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  remoteLoggingEndpoint?: string;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsoleOutput: true,
  enableRemoteLogging: false,
};

/**
 * Logger service for consistent logging across the application
 */
class Logger {
  private config: LoggerConfig = DEFAULT_CONFIG;

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string | Error, ...args: any[]): void {
    const errorMessage = message instanceof Error ? message.message : message;
    const stack = message instanceof Error ? message.stack : undefined;
    
    this.log(LogLevel.ERROR, errorMessage, ...args, stack ? { stack } : undefined);
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // Skip if below minimum level
    if (level < this.config.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formattedMessage = `[${timestamp}] [${levelName}] ${message}`;

    // Console logging
    if (this.config.enableConsoleOutput) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    }

    // Remote logging
    if (this.config.enableRemoteLogging && this.config.remoteLoggingEndpoint) {
      this.sendRemoteLog({
        level: levelName,
        message,
        timestamp,
        args,
      }).catch(err => {
        // Fallback to console if remote logging fails
        console.error('Failed to send log to remote endpoint:', err);
      });
    }
  }

  /**
   * Send a log to the remote endpoint
   */
  private async sendRemoteLog(logEntry: any): Promise<void> {
    if (!this.config.remoteLoggingEndpoint) return;

    try {
      await fetch(this.config.remoteLoggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Intentionally empty to avoid infinite loops
    }
  }
}

// Create and export a singleton instance
const logger = new Logger();
export default logger;

// Export types for consumers
export { LogLevel };
