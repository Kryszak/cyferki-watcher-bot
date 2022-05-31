const {getLogger} = require('../logging/logging');
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
  const logger = getLogger(message.guild.name);
  logger.info(`Removing message from ${message.author.username}: ${message.content}`);
  message.delete()
      .then(() => logger.info(`Successfully removed message: ${message.content} from ${message.author.username}`))
      .catch((error) => {
        if (error.httpStatus !== 404) {
          logger.error('Error while removing message: %o', error);
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
