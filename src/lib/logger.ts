type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  durationMs?: number;
}

// In-memory ring buffer so we can expose recent logs via /api/debug
const LOG_BUFFER_SIZE = 200;
const logBuffer: LogEntry[] = [];

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function formatLog(entry: LogEntry): string {
  const dur = entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : '';
  const data = entry.data !== undefined ? ` | ${JSON.stringify(entry.data)}` : '';
  return `[${entry.timestamp}] [${entry.level}] [${entry.module}] ${entry.message}${dur}${data}`;
}

function log(level: LogLevel, module: string, message: string, data?: unknown, durationMs?: number) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data,
    durationMs,
  };

  addToBuffer(entry);

  const formatted = formatLog(entry);
  switch (level) {
    case 'ERROR':
      console.error(formatted);
      break;
    case 'WARN':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function createLogger(module: string) {
  return {
    debug: (msg: string, data?: unknown) => log('DEBUG', module, msg, data),
    info: (msg: string, data?: unknown) => log('INFO', module, msg, data),
    warn: (msg: string, data?: unknown) => log('WARN', module, msg, data),
    error: (msg: string, data?: unknown) => log('ERROR', module, msg, data),
    timed: async <T>(label: string, fn: () => Promise<T>, data?: unknown): Promise<T> => {
      const start = Date.now();
      log('INFO', module, `${label} - started`, data);
      try {
        const result = await fn();
        log('INFO', module, `${label} - completed`, undefined, Date.now() - start);
        return result;
      } catch (err) {
        log('ERROR', module, `${label} - failed: ${(err as Error).message}`, undefined, Date.now() - start);
        throw err;
      }
    },
  };
}

export function getRecentLogs(count: number = 50): LogEntry[] {
  return logBuffer.slice(-count);
}

export function getLogsByModule(module: string, count: number = 50): LogEntry[] {
  return logBuffer.filter((e) => e.module === module).slice(-count);
}
