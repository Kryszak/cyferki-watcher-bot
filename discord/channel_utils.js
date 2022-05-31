const {getLogger} = require('../logging/logging');
require('dotenv').config();

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;

function getChannel(client, message) {
  return client.channels.cache.get(message.channelId);
}

function isSentToWatchedChannel(channel) {
  return channel.name === WATCHED_CHANNEL;
}

function removeSendMessagePermissions(channel) {
  const logger = getLogger(channel.guild.name);
  logger.info('Locking channel after finished game.');
  channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
    SEND_MESSAGES: false,
  }).then(() => logger.info('Channel locked after finished game.'))
      .catch((error) => logger.error('Failed to lock channel.', error));
}

module.exports = {
  getChannel: getChannel,
  isSentToWatchedChannel: isSentToWatchedChannel,
  removeSendMessagePermissions: removeSendMessagePermissions,
};
