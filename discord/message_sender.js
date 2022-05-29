const logger = require('loglevel');
require('dotenv').config();

const WRONG_INCREMENT_MESSAGE = process.env.BOT_WRONG_NUMBER_MESSAGE;
const WRONG_MESSAGE_CONTENT = process.env.BOT_WRONG_MESSAGE_FORMAT;
const RANK_WON_MESSAGE_CONTENT = process.env.BOT_RANK_WON_MESSAGE;
const GAME_OVER_MESSAGE_CONTENT = process.env.BOT_GAME_OVER_MESSAGE;

function notifyWrongNumberProvided(channel, authorId) {
  channel.send(`<@${authorId}> ${WRONG_INCREMENT_MESSAGE}`);
}

function notifyWrongMessageFormat(channel, authorId) {
  channel.send(`<@${authorId}> ${WRONG_MESSAGE_CONTENT}`);
}

function notifyPrizedNumber(channel, authorId, roleId) {
  channel.send(`<@${authorId}>, ${RANK_WON_MESSAGE_CONTENT} <@&${roleId}>!`);
}

function notifyGameOver(channel) {
  return channel.send(GAME_OVER_MESSAGE_CONTENT);
}

function deleteMessage(message) {
  logger.info(`[${message.guild.name}] removing message from ${message.author.username}: ${message.content}`);
  message.delete()
      .then(() => logger.info(`[${message.guild.name}] Successfully removed message: ${message.content} from ${message.author.username}`))
      .catch((error) => {
        if (error.httpStatus !== 404) {
          logger.error(`[${message.guild.name}] Error while removing message: %o`, error);
        }
      });
}

module.exports = {
  notifyWrongNumberProvided: notifyWrongNumberProvided,
  notifyWrongMessageFormat: notifyWrongMessageFormat,
  notifyPrizedNumber: notifyPrizedNumber,
  notifyGameOver: notifyGameOver,
  deleteMessage: deleteMessage,
};
