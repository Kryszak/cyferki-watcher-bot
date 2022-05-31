const loglevel = require('loglevel');
const prefix = require('loglevel-plugin-prefix');
const chalk = require('chalk');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.gray,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

function formatTimestamp(timestamp) {
  return chalk.gray(`[${timestamp}]`);
}

function formatLevel(level) {
  return colors[level.toUpperCase()](level.padEnd(5));
}

function formatName(name) {
  return chalk.green(`[${name}]`);
}

prefix.reg(loglevel);
prefix.apply(loglevel, {
  format(level, name, timestamp) {
    return `${formatTimestamp(timestamp)} ${formatLevel(level)} ${formatName(name)}:`;
  },
});
loglevel.setLevel(LOG_LEVEL);

function getLogger(name) {
  return loglevel.getLogger(name);
}

module.exports = {
  getLogger: getLogger,
};
