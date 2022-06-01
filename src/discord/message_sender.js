const {getLogger} = require('../logging/logging');
const {
  getWrongIncrementMessage,
  getWrongMessageContent,
  getRankWonMessageContent,
  getGameOverMessageContent,
} = require('../globals');


function notifyWrongNumberProvided(channel, authorId) {
  channel.send(`<@${authorId}> ${getWrongIncrementMessage()}`);
}

function notifyWrongMessageFormat(channel, authorId) {
  channel.send(`<@${authorId}> ${getWrongMessageContent()}`);
}

function notifyPrizedNumber(channel, authorId, roleId) {
  channel.send(`<@${authorId}>, ${getRankWonMessageContent()} <@&${roleId}>!`);
}

function notifyGameOver(channel) {
  return channel.send(getGameOverMessageContent());
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
