const logger = require('loglevel');
const prefix = require('loglevel-plugin-prefix');
const chalk = require('chalk');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(logger);
prefix.apply(logger, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)}:`;
  },
});
logger.setLevel(LOG_LEVEL);

module.exports = {
  logger: logger,
};
