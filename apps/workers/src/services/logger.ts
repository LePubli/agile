export class Logger {
  private static prefix = '[NexusOS Worker]';

  static info(message: string): void {
    console.log(`${this.prefix} [INFO] ${new Date().toISOString()} - ${message}`);
  }

  static error(message: string, error?: any): void {
    console.error(`${this.prefix} [ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static warn(message: string): void {
    console.warn(`${this.prefix} [WARN] ${new Date().toISOString()} - ${message}`);
  }

  static debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(`${this.prefix} [DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
}
