import Globals from "../Globals";
import * as loglevel from 'loglevel';
import { Logger, LogLevelDesc } from 'loglevel';
import * as prefix from 'loglevel-plugin-prefix';
import * as chalk from 'chalk';
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class LoggerFactory {
    private static readonly COLORS: any = {
        TRACE: chalk.magenta,
        DEBUG: chalk.gray,
        INFO: chalk.blue,
        WARN: chalk.yellow,
        ERROR: chalk.red,
    };

    private globals: Globals;

    constructor(globals: Globals) {
        this.globals = globals;
        this.initializeLoggerFactory();
    }

    getLogger(name: string): Logger {
        return loglevel.getLogger(name);
    }

    private initializeLoggerFactory(): void {
        prefix.reg(loglevel);
        prefix.apply(loglevel, {
            format(level: string, name: string, timestamp: Date) {
                return `${LoggerFactory.formatTimestamp(timestamp)} ${LoggerFactory.formatLevel(level)} ${LoggerFactory.formatName(name)}:`;
            },
        });
        loglevel.setLevel(this.getLogLevel());
    }

    private static formatTimestamp(timestamp: Date): string {
        return chalk.gray(`[${timestamp}]`);
    }

    private static formatLevel(level: string): string {
        return this.COLORS[level.toUpperCase()](level.padEnd(5));
    }

    private static formatName(name: string): string {
        return chalk.green(`[${name}]`);
    }

    private getLogLevel(): LogLevelDesc {
        return this.globals.getLogLevel() as LogLevelDesc || 'info';
    }
}